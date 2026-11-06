import httpx
import pytest

from app.main import app
from app.services.safety import check_emergency

OK_PROVIDER_BODY = {"choices": [{"message": {"role": "assistant", "content": "## Overview\nHypertension is high blood pressure."}}]}


def use_transport(handler):
    app.state.provider_transport = httpx.MockTransport(handler)


# ---------- validation ----------
@pytest.mark.parametrize("msg", ["", " ", "a", "   a   "])
def test_empty_or_too_short_message_rejected(client, msg):
    r = client.post("/api/chat", json={"message": msg})
    assert r.status_code == 422
    assert r.json()["error"] == "invalid_request"


def test_missing_message_rejected(client):
    assert client.post("/api/chat", json={}).status_code == 422


def test_message_length_limit(client):
    assert client.post("/api/chat", json={"message": "x" * 4001}).status_code == 422
    assert client.post("/api/chat", json={"message": "x" * 4000}).status_code == 200


def test_department_validation(client):
    assert client.post("/api/chat", json={"message": "What is asthma?", "department": "A" * 61}).status_code == 422
    assert client.post("/api/chat", json={"message": "What is asthma?", "department": "<script>"}).status_code == 422
    assert client.post("/api/chat", json={"message": "What is asthma?", "department": "respiratory-health"}).status_code == 200


def test_validation_error_does_not_echo_input(client):
    secret_text = "UNIQUE-PRIVATE-MARKER-9137 " + "x" * 5000
    r = client.post("/api/chat", json={"message": secret_text})
    assert r.status_code == 422
    assert "UNIQUE-PRIVATE-MARKER-9137" not in r.text
    assert set(r.json()) == {"error", "message"}


def test_oversized_body_rejected(client):
    r = client.post("/api/chat", json={"message": "hello there", "history": [{"role": "user", "content": "y" * 5000}] * 8, "pad": "z" * 200_000})
    assert r.status_code == 413


# ---------- demo mode ----------
def test_demo_mode_without_credentials(client):
    r = client.post("/api/chat", json={"message": "What is diabetes?", "department": "general-health"})
    assert r.status_code == 200
    body = r.json()
    assert set(body) == {"answer", "mode", "safety_notice"}
    assert body["mode"] == "demo"
    assert "not connected" in body["answer"].lower()
    assert body["safety_notice"]
    # must not fabricate a medical explanation or references
    lowered = body["answer"].lower()
    assert "doi" not in lowered and "pmid" not in lowered and "http" not in lowered


def test_partial_configuration_stays_in_demo(client, monkeypatch):
    monkeypatch.setenv("AI_API_KEY", "sk-test-FAKE")
    r = client.post("/api/chat", json={"message": "What is diabetes?"})
    assert r.json()["mode"] == "demo"


# ---------- AI mode (mocked provider) ----------
def test_ai_success_returns_provider_answer(client, configured):
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["auth"] = request.headers.get("authorization")
        seen["json"] = request.read().decode()
        return httpx.Response(200, json=OK_PROVIDER_BODY)

    use_transport(handler)
    r = client.post("/api/chat", json={"message": "What is hypertension?", "department": "cardiology"})
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "ai"
    assert "high blood pressure" in body["answer"]
    assert set(body) == {"answer", "mode", "safety_notice"}
    assert seen["url"] == "https://provider.example/v1/chat/completions"
    assert seen["auth"] == "Bearer sk-test-FAKE-KEY-123"  # key used server-side only
    assert "Cardiology" in seen["json"]  # department reached the prompt
    assert "sk-test-FAKE-KEY-123" not in r.text


def test_follow_up_history_is_forwarded(client, configured):
    captured = {}

    def handler(request):
        import json
        captured["messages"] = json.loads(request.read())["messages"]
        return httpx.Response(200, json=OK_PROVIDER_BODY)

    use_transport(handler)
    history = [{"role": "user", "content": "What is asthma?"}, {"role": "assistant", "content": "Asthma is a chronic airway condition."}]
    client.post("/api/chat", json={"message": "What triggers it?", "history": history})
    roles = [m["role"] for m in captured["messages"]]
    assert roles == ["system", "user", "assistant", "user"]
    assert captured["messages"][-1]["content"] == "What triggers it?"


# ---------- provider failures: honest errors, never fake answers ----------
def test_provider_timeout(client, configured):
    def handler(request):
        raise httpx.ReadTimeout("slow", request=request)

    use_transport(handler)
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == 504
    assert r.json()["error"] == "provider_timeout"
    assert "answer" not in r.json()


def test_provider_network_failure(client, configured):
    def handler(request):
        raise httpx.ConnectError("boom", request=request)

    use_transport(handler)
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == 502
    assert r.json()["error"] == "provider_unreachable"


@pytest.mark.parametrize(
    "status,expected_status,code",
    [(401, 502, "provider_auth"), (403, 502, "provider_auth"), (429, 429, "provider_rate_limited"), (500, 502, "provider_error"), (400, 502, "provider_error")],
)
def test_provider_http_errors(client, configured, status, expected_status, code):
    use_transport(lambda request: httpx.Response(status, json={"error": {"message": "secret detail sk-test-FAKE-KEY-123"}}))
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == expected_status
    assert r.json()["error"] == code
    assert "sk-test-FAKE-KEY-123" not in r.text
    assert "secret detail" not in r.text


@pytest.mark.parametrize("payload", [{}, {"choices": []}, {"choices": [{"message": {}}]}, {"choices": [{"message": {"content": "   "}}]}])
def test_provider_malformed_response(client, configured, payload):
    use_transport(lambda request: httpx.Response(200, json=payload))
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == 502
    assert r.json()["error"] == "provider_malformed"


def test_provider_non_json_response(client, configured):
    use_transport(lambda request: httpx.Response(200, text="<html>not json</html>"))
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == 502


# ---------- emergency handling ----------
@pytest.mark.parametrize(
    "text",
    [
        "I can't breathe and my lips are blue",
        "My dad's face is drooping and his speech is slurred",
        "I have severe chest pain spreading to my left arm",
        "My friend is unconscious and not responding",
        "There is heavy bleeding that won't stop",
        "I think I overdosed on pills",
        "I want to kill myself",
    ],
)
def test_emergency_messages_bypass_ai(client, configured, text):
    called = {"n": 0}

    def handler(request):
        called["n"] += 1
        return httpx.Response(200, json=OK_PROVIDER_BODY)

    use_transport(handler)
    r = client.post("/api/chat", json={"message": text})
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "safety"
    assert called["n"] == 0  # AI never called before safety guidance
    assert "emergency" in body["answer"].lower() or "crisis" in body["answer"].lower()


def test_emergency_guidance_has_no_hardcoded_phone_numbers(client):
    import re

    for text in ["I can't breathe", "I want to kill myself"]:
        answer = client.post("/api/chat", json={"message": text}).json()["answer"]
        assert not re.search(r"\d{3}", answer)


@pytest.mark.parametrize("text", ["What is asthma?", "How is hypertension diagnosed?", "Explain the stages of breast cancer"])
def test_normal_questions_not_flagged(text):
    assert check_emergency(text).is_emergency is False


# ---------- secrets / errors ----------
def test_unhandled_error_hides_details(client, configured, monkeypatch):
    import app.main as main

    async def boom(*a, **k):
        raise RuntimeError("secret-internal-detail sk-test-FAKE-KEY-123")

    monkeypatch.setattr(main, "generate_answer", boom)
    r = client.post("/api/chat", json={"message": "What is anemia?"})
    assert r.status_code == 500
    assert "secret-internal-detail" not in r.text
    assert "sk-test-FAKE-KEY-123" not in r.text
    assert "Traceback" not in r.text


def test_cors_only_allows_configured_origin(client):
    ok = client.options("/api/chat", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    bad = client.options("/api/chat", headers={"Origin": "http://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers
