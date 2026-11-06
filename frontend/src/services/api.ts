import type { ChatApiResponse, HistoryTurn } from "../types";

/** Same-origin path. In dev, Vite proxies /api to the FastAPI server (see vite.config.ts). */
const API_BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface HealthInfo {
  status: string;
  app: string;
  ai_configured: boolean;
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthInfo> {
  const res = await fetch(`${API_BASE}/health`, { signal });
  if (!res.ok) throw new ApiError("Health check failed", res.status);
  return (await res.json()) as HealthInfo;
}

export async function sendChat(
  message: string,
  department: string,
  history: HistoryTurn[],
  signal?: AbortSignal,
): Promise<ChatApiResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, department, history }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("Could not reach the MedCompass server. Check that the backend is running, then try again.", 0);
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = (await res.json()) as { message?: unknown };
      if (typeof data.message === "string") message = data.message;
    } catch {
      /* non-JSON error body: keep the generic message */
    }
    throw new ApiError(message, res.status);
  }

  const data = (await res.json()) as Partial<ChatApiResponse>;
  if (typeof data.answer !== "string" || (data.mode !== "demo" && data.mode !== "ai" && data.mode !== "safety")) {
    throw new ApiError("The server sent an unexpected response. Please try again.", res.status);
  }
  return { answer: data.answer, mode: data.mode, safety_notice: String(data.safety_notice ?? "") };
}
