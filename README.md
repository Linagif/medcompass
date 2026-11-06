# MedCompass: Phase 1 prototype

**Reliable medical knowledge. Clearly explained.**

MedCompass is a prototype *medical knowledge library* with a conversational assistant. It helps people explore general, educational information about conditions, treatments, prevention and medical research. It is **not** a diagnostic tool and does **not** replace a qualified healthcare professional.

> **Phase 1 limitations (please read).** Answers come from an AI model's *general knowledge*. MedCompass does **not** yet retrieve, check or cite real sources, so references are **not verified** and the model can be wrong. Verified retrieval and citation checking are Phase 2 goals. The built-in emergency check is a basic keyword safeguard, **not** a clinically validated triage system. It is not ready for unrestricted public use.

## What works in Phase 1

- Responsive homepage, sidebar (mobile drawer), top bar, 16 department cards from one reusable config.
- Ask directly, or pick a department for *context* (you can still ask about anything).
- Follow-up questions in the same conversation (kept in browser memory only).
- Clear labels: **Demo mode** (no AI connected), **AI-generated**, or **Safety guidance**.
- Loading indicator, readable errors, and a **Try again** button. A provider failure is never replaced by a fake answer.
- Emergency screening *before* any AI call (breathing, stroke signs, severe chest pain, unconsciousness, severe bleeding, overdose, self-harm). No phone numbers are hardcoded because they differ by country.
- Model output is untrusted: it is rendered as Markdown into React elements. Raw HTML is not rendered, images are dropped, and links open with `rel="noopener noreferrer nofollow"`.

## Project layout

```
medcompass/
├── backend/                    FastAPI (Python 3.11+)
│   ├── requirements.txt
│   ├── .env.example            safe placeholders, copy to .env
│   ├── pytest.ini
│   └── app/
│       ├── main.py             routes, CORS, error handling, logging (routing only)
│       ├── config.py           reads environment variables (server-side only)
│       ├── schemas.py          request/response validation (Pydantic)
│       ├── services/
│       │   ├── ai_provider.py  the ONLY place that talks to the AI provider
│       │   ├── safety.py       emergency screening + safety notice (replaceable module)
│       │   └── prompts.py      system prompt + department context
│       └── tests/              pytest suite
└── frontend/                   React + TypeScript + Vite + Tailwind
    └── src/
        ├── App.tsx             state: department, conversation, loading, errors
        ├── components/         Sidebar, TopBar, HomeView, ConversationView, ...
        ├── config/departments.ts   the department list (single source)
        ├── services/api.ts     the only file that calls the backend
        └── styles/index.css    design-system building blocks
```

## Run it locally

You need **Python 3.11+** and **Node.js 18+**.

### 1. Backend (terminal 1)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then edit .env (optional, see below)
uvicorn app.main:app --reload --port 8000
```

Check it: <http://127.0.0.1:8000/api/health> (interactive docs: `/api/docs`).

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. In development Vite forwards `/api/*` to `http://127.0.0.1:8000`, so the browser never sees the API key.

### Production build check

```bash
cd frontend && npm run build       # runs the TypeScript check, then builds
```

## Configuration (`backend/.env`)

| Variable | Meaning |
|---|---|
| `AI_API_KEY` | Your provider key. **Leave empty for demo mode.** Never commit it. |
| `AI_BASE_URL` | An OpenAI-compatible base URL, e.g. `https://api.openai.com/v1`. The app calls `{AI_BASE_URL}/chat/completions`. |
| `AI_MODEL` | Model name from your provider. |
| `FRONTEND_ORIGIN` | The one browser origin allowed by CORS (default `http://localhost:5173`). |
| `AI_TIMEOUT_SECONDS` | Optional, default 45 (limited to 5–120). |

AI mode turns on only when key, base URL **and** model are all set. Restart the backend after editing `.env`. `.env` is git-ignored.

## API

- `GET /api/health` → `{ "status": "ok", "app": "MedCompass", "ai_configured": true|false }`
- `POST /api/chat`
  - Request: `{ "message": string (2–4000 chars), "department": string (optional, default "general-health"), "history": [{role, content}] (optional, ≤ 8 recent turns) }`
  - Response: `{ "answer": string, "mode": "demo" | "ai" | "safety", "safety_notice": string }`
  - Errors: `{ "error": code, "message": safe text }` with status 422 (invalid), 413 (too large), 429 (provider rate limit), 502 (provider rejected/unexpected), 504 (provider timeout), 500 (unexpected).

Two small additions beyond the original brief: the optional `history` field (needed for follow-up questions without storing anything on the server) and a third mode value `"safety"` (so built-in emergency guidance is not mislabelled as demo or AI).

## Privacy and security notes

- The API key lives only in backend environment variables and is never sent to, or bundled for, the browser.
- The server stores no conversations. Logs record only metadata (request id, department, message length, mode), never the question or answer text.
- In AI mode your question is sent to the configured provider, which may process it under **its own** data-handling terms. Check them. This project does not claim the provider never stores data.
- Please don't enter names, ID numbers, addresses or other identifying details.
- **Before any public deployment** you still need: rate limiting, authentication/abuse protection, HTTPS, a locked-down CORS origin, request logging policy, dependency auditing, and clinical/legal review.

## Safety logic

`backend/app/services/safety.py` holds a list of patterns checked before any AI call. Limits: keyword matching misses unusual wording, misspellings and other languages, and may sometimes fire when it shouldn't. It is deliberately isolated so it can be replaced by a better approach later.

## Tests

```bash
cd backend && source .venv/bin/activate && pytest -v
```

Covers: health, empty/short/over-long input, department validation, demo mode, mocked AI success, follow-up history, provider timeout/network/auth/rate-limit/server/malformed responses, emergency messages (AI is never called), response schema, no secrets in responses, hidden internal errors, and CORS.

## Verification status of this build

This project was written in a sandbox whose network policy blocked **PyPI and the npm registry**, so dependencies could not be installed. Therefore:

- **Run:** Python syntax check of all backend files; the emergency-screening module and request-validation schemas (offline script: 9 emergency and 8 normal sample messages, plus validation limits). These passed.
- **Not run:** the pytest suite, the live API, `npm install`, the TypeScript type check and the Vite build, and the browser checks (responsive layout, department selection, follow-ups, loading/error states). Please run the commands above on your machine and fix anything they report. Package versions in `package.json` were chosen from memory and not verified against the registry.

## Troubleshooting

- **Sidebar says "Server not reachable":** start the backend (`uvicorn ...`) on port 8000 and refresh.
- **Always "Demo mode":** `AI_API_KEY`, `AI_BASE_URL` and `AI_MODEL` must all be set in `backend/.env`; restart the backend.
- **"AI provider rejected the server's credentials":** check the key and that the base URL matches that provider.
- **CORS error in the browser console:** `FRONTEND_ORIGIN` must exactly match the page's origin (scheme, host, port).
- **`pytest` can't import `app`:** run it from inside `backend/`.
- **Windows PowerShell can't activate the venv:** run `Set-ExecutionPolicy -Scope Process RemoteSigned`.

## Roadmap (not built yet)

Phase 2 adds curated source ingestion, keyword + semantic retrieval, source ranking and evidence assessment, retrieval-augmented answers, citation validation with real links, publication/retraction checks and versioned content. The seam for it is `services/ai_provider.py` plus `prompts.py`: retrieval would run before `generate_answer` and pass retrieved passages in.
