"""MedCompass API (Phase 1).

Routing only: validation lives in schemas.py, safety rules in services/safety.py,
and the AI provider in services/ai_provider.py.
"""
from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import APP_NAME, APP_VERSION, get_settings
from .schemas import ChatRequest, ChatResponse, HealthResponse
from .services.ai_provider import ProviderError, generate_answer
from .services.prompts import department_label
from .services.safety import SAFETY_NOTICE, check_emergency

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("medcompass.api")

MAX_BODY_BYTES = 128 * 1024  # fits a 4,000-char question plus 8 history turns

app = FastAPI(title=f"{APP_NAME} API", version=APP_VERSION, docs_url="/api/docs", openapi_url="/api/openapi.json")

# CORS: only the configured frontend origin may call the API from a browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().frontend_origin],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

# Tests set this to a fake httpx transport. It is always None in normal use.
app.state.provider_transport = None


@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    length = request.headers.get("content-length")
    if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
        return JSONResponse(
            status_code=413,
            content={"error": "payload_too_large", "message": "The request is too large."},
        )
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    # Do not echo the submitted text back; only say what was wrong.
    return JSONResponse(
        status_code=422,
        content={
            "error": "invalid_request",
            "message": "Your question must be between 2 and 4,000 characters. Please check it and try again.",
        },
    )


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    logger.error("unhandled_error type=%s", type(exc).__name__)  # no stack trace to the client
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "Something went wrong on the server. Please try again."},
    )


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", app=APP_NAME, ai_configured=get_settings().ai_configured)


def _demo_answer(department: str) -> str:
    return (
        "### Demo mode: the AI provider is not connected\n\n"
        "MedCompass received your question, but no language-model provider is configured on "
        "this server, so **no medical explanation has been generated**. This message is a "
        "placeholder, not medical information.\n\n"
        f"- **Selected department:** {department_label(department)}\n"
        "- **To enable AI answers:** the server administrator sets `AI_API_KEY`, `AI_BASE_URL` "
        "and `AI_MODEL` in `backend/.env` and restarts the backend.\n"
        "- **References:** none are shown here. Verified medical sources and citation checking "
        "are planned for a later phase and do not exist yet.\n\n"
        "For personal health concerns, please speak with a qualified healthcare professional."
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, request: Request):
    request_id = uuid.uuid4().hex[:8]
    settings = get_settings()
    # Log metadata only: never the health message itself.
    logger.info("chat_request id=%s dept=%s chars=%d history=%d", request_id, body.department, len(body.message), len(body.history))

    # 1) Emergency screening always happens BEFORE any AI call.
    safety = check_emergency(body.message)
    if safety.is_emergency:
        logger.info("chat_safety_triggered id=%s category=%s", request_id, safety.category)
        return ChatResponse(answer=safety.message or "", mode="safety", safety_notice=SAFETY_NOTICE)

    # 2) No provider configured -> clearly labelled demo response (no fake medical content).
    if not settings.ai_configured:
        logger.info("chat_demo id=%s", request_id)
        return ChatResponse(answer=_demo_answer(body.department), mode="demo", safety_notice=SAFETY_NOTICE)

    # 3) Real provider call. Failures are reported honestly, never replaced by fake answers.
    try:
        answer = await generate_answer(
            body.message, body.department, body.history, settings, transport=request.app.state.provider_transport
        )
    except ProviderError as err:
        logger.warning("chat_provider_error id=%s code=%s", request_id, err.code)
        return JSONResponse(status_code=err.http_status, content={"error": err.code, "message": err.public_message})

    logger.info("chat_ai_ok id=%s answer_chars=%d", request_id, len(answer))
    return ChatResponse(answer=answer, mode="ai", safety_notice=SAFETY_NOTICE)
