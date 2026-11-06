"""AI provider integration (OpenAI-compatible chat-completions API).

All provider-specific logic lives in this file. To support another provider
later (Anthropic native API, a local model, a retrieval pipeline...), add a new
function with the same signature and select it in main.py.

The API key is only ever used here, on the server.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from ..config import Settings
from ..schemas import HistoryItem
from .prompts import build_system_prompt

logger = logging.getLogger("medcompass.provider")

# Conservative generation settings. These reduce randomness; they do NOT guarantee accuracy.
TEMPERATURE = 0.2
MAX_OUTPUT_TOKENS = 1800


class ProviderError(Exception):
    """A provider problem with a message that is safe to show to the user."""

    def __init__(self, code: str, public_message: str, http_status: int):
        super().__init__(code)
        self.code = code
        self.public_message = public_message
        self.http_status = http_status


def _build_messages(message: str, department: str, history: list[HistoryItem]) -> list[dict[str, str]]:
    msgs: list[dict[str, str]] = [{"role": "system", "content": build_system_prompt(department)}]
    for item in history[-10:]:
        msgs.append({"role": item.role, "content": item.content})
    msgs.append({"role": "user", "content": message})
    return msgs


async def generate_answer(
    message: str,
    department: str,
    history: list[HistoryItem],
    settings: Settings,
    transport: httpx.AsyncBaseTransport | None = None,
) -> str:
    """Call the provider and return the answer text, or raise ProviderError.

    `transport` exists so automated tests can supply a fake HTTP layer.
    """
    if not settings.ai_configured:
        # Defensive: callers should check first.
        raise ProviderError("not_configured", "The AI provider is not configured.", 503)

    url = f"{settings.ai_base_url}/chat/completions"
    payload: dict[str, Any] = {
        "model": settings.ai_model,
        "messages": _build_messages(message, department, history),
        "temperature": TEMPERATURE,
        "max_tokens": MAX_OUTPUT_TOKENS,
    }
    headers = {
        "Authorization": f"Bearer {settings.ai_api_key}",
        "Content-Type": "application/json",
    }
    timeout = httpx.Timeout(settings.ai_timeout_seconds, connect=10.0)

    try:
        async with httpx.AsyncClient(timeout=timeout, transport=transport) as client:
            resp = await client.post(url, json=payload, headers=headers)
    except httpx.TimeoutException:
        logger.warning("provider_timeout")
        raise ProviderError(
            "provider_timeout", "The AI provider took too long to respond. Please try again.", 504
        ) from None
    except httpx.HTTPError as exc:
        # Log only the exception type, never the URL/headers/body.
        logger.warning("provider_network_error type=%s", type(exc).__name__)
        raise ProviderError(
            "provider_unreachable", "Could not reach the AI provider. Please try again later.", 502
        ) from None

    if resp.status_code in (401, 403):
        logger.error("provider_auth_error status=%s", resp.status_code)
        raise ProviderError(
            "provider_auth",
            "The AI provider rejected the server's credentials. The administrator needs to check the configuration.",
            502,
        )
    if resp.status_code == 429:
        logger.warning("provider_rate_limited")
        raise ProviderError(
            "provider_rate_limited", "The AI provider is busy or rate-limited. Please wait a moment and retry.", 429
        )
    if resp.status_code >= 400:
        logger.error("provider_http_error status=%s", resp.status_code)
        raise ProviderError("provider_error", "The AI provider returned an error. Please try again later.", 502)

    try:
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError):
        logger.error("provider_malformed_response")
        raise ProviderError(
            "provider_malformed", "The AI provider returned an unexpected response. Please try again.", 502
        ) from None

    if not isinstance(content, str) or not content.strip():
        logger.error("provider_empty_response")
        raise ProviderError("provider_malformed", "The AI provider returned an empty answer. Please try again.", 502)

    return content.strip()
