def test_health_ok_without_provider(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "app": "MedCompass", "ai_configured": False}


def test_health_reports_configured_without_leaking_secrets(client, configured):
    r = client.get("/api/health")
    body = r.json()
    assert body["ai_configured"] is True
    text = r.text
    assert "sk-test-FAKE-KEY-123" not in text
    assert "provider.example" not in text
    assert "test-model" not in text
