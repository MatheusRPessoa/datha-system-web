import type { ApiErrorBody } from "@/lib/api-types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const TOKEN_KEY = "dathasystem_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok || (body && body.succeeded === false)) {
    const err = body as ApiErrorBody | null
    throw new ApiError(err?.message ?? `Erro ${res.status}`, res.status, err?.error)
  }

  return body as T
}
