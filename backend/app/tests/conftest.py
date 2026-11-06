"""Shared test setup: every test starts with NO provider configured and no fake transport."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for name in ("AI_API_KEY", "AI_BASE_URL", "AI_MODEL"):
        monkeypatch.delenv(name, raising=False)
    app.state.provider_transport = None
    yield
    app.state.provider_transport = None


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def configured(monkeypatch):
    """Pretend a provider is configured. The key below is a fake test value."""
    monkeypatch.setenv("AI_API_KEY", "sk-test-FAKE-KEY-123")
    monkeypatch.setenv("AI_BASE_URL", "https://provider.example/v1")
    monkeypatch.setenv("AI_MODEL", "test-model")
