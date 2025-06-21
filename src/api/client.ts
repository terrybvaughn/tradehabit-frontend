// Lightweight typed wrapper around fetch for TradeHabit front-end.
// Reads base URL from Vite env, injects JWT if present, and normalises error handling.

const BASE_URL: string = (import.meta.env.VITE_API_URL as string) ?? "";

/**
 * Unified error object thrown for any non-2xx HTTP response.
 */
export class TradeHabitApiError extends Error {
  /** HTTP status code returned by the backend */
  readonly status: number;
  /** Optional structured error details from backend */
  readonly details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = "TradeHabitApiError";
  }
}

// JSON value helper – object, array, or null.
export type Json = Record<string, unknown> | Array<unknown> | null;

// Build request headers, adding a Bearer token if it exists in localStorage.
function buildHeaders(omitContentType: boolean = false): HeadersInit {
  const headers: HeadersInit = {};

  if (!omitContentType) {
    headers["Content-Type"] = "application/json";
  }

  const jwt = localStorage.getItem("tradehabit_jwt");
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  return headers;
}

// Convert the Response to JSON (if possible) and throw on error status codes.
async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON – leave as null.
  }

  if (res.ok) {
    return data as T;
  }

  const message = data?.message ?? data?.error ?? data?.detail ?? res.statusText;
  const details = Array.isArray(data?.details) ? (data.details as string[]) : undefined;
  throw new TradeHabitApiError(message, res.status, details);
}

async function request<T>(
  method: string,
  path: string,
  body?: Json | FormData,
  init?: RequestInit
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: buildHeaders(isFormData),
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...init,
  });

  return handleResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>("GET", path, undefined, init),
  post: <T>(path: string, body?: Json | FormData, init?: RequestInit) =>
    request<T>("POST", path, body, init),
  put: <T>(path: string, body?: Json | FormData, init?: RequestInit) =>
    request<T>("PUT", path, body, init),
  patch: <T>(path: string, body?: Json | FormData, init?: RequestInit) =>
    request<T>("PATCH", path, body, init),
  del: <T>(path: string, init?: RequestInit) => request<T>("DELETE", path, undefined, init),
}; 