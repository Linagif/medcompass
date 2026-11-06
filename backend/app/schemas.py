"""Request and response shapes. Pydantic validates every incoming request."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

MAX_MESSAGE_CHARS = 4000
MAX_HISTORY_ITEMS = 8
MAX_HISTORY_CHARS = 6000  # AI answers can be longer than a user question


class HistoryItem(BaseModel):
    """One earlier turn of the current conversation (sent by the browser for follow-ups)."""

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=MAX_HISTORY_CHARS)


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=MAX_MESSAGE_CHARS)
    department: str = Field(default="general-health", max_length=60, pattern=r"^[a-z0-9-]+$")
    # Optional recent turns so follow-up questions have context. Not stored server-side.
    history: list[HistoryItem] = Field(default_factory=list, max_length=MAX_HISTORY_ITEMS)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("message must contain at least 2 non-space characters")
        return v


class ChatResponse(BaseModel):
    answer: str
    # "demo"   = AI provider not configured; no medical content generated
    # "ai"     = answer came from the configured language-model provider
    # "safety" = built-in emergency guidance shown instead of a normal answer
    mode: Literal["demo", "ai", "safety"]
    safety_notice: str


class HealthResponse(BaseModel):
    status: str
    app: str
    ai_configured: bool


class ErrorBody(BaseModel):
    error: str
    message: str
