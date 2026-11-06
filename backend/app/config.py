"""Application configuration.

All secrets are read from environment variables (optionally loaded from
backend/.env) and live ONLY on the backend. Nothing here is ever sent to the
browser.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

APP_NAME = "MedCompass"
APP_VERSION = "0.1.0-phase1"

# Load backend/.env if it exists. Real environment variables win over the file.
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_FILE, override=False)


@dataclass(frozen=True)
class Settings:
    ai_api_key: str
    ai_base_url: str
    ai_model: str
    frontend_origin: str
    ai_timeout_seconds: float

    @property
    def ai_configured(self) -> bool:
        """True only when everything needed to call the provider is present."""
        return bool(self.ai_api_key and self.ai_base_url and self.ai_model)


def get_settings() -> Settings:
    """Read settings fresh from the environment (makes tests easy to isolate)."""
    try:
        timeout = float(os.getenv("AI_TIMEOUT_SECONDS", "45"))
    except ValueError:
        timeout = 45.0
    timeout = min(max(timeout, 5.0), 120.0)
    return Settings(
        ai_api_key=os.getenv("AI_API_KEY", "").strip(),
        ai_base_url=os.getenv("AI_BASE_URL", "").strip().rstrip("/"),
        ai_model=os.getenv("AI_MODEL", "").strip(),
        frontend_origin=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").strip(),
        ai_timeout_seconds=timeout,
    )
