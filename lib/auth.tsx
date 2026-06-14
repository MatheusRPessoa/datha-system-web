"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { apiFetch, clearToken, getToken, setToken } from "@/lib/api"
import { authUserFromApi, type AuthUser } from "@/lib/adapters"
import type { ApiAuthUser, ApiEnvelope } from "@/lib/api-types"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    apiFetch<ApiEnvelope<ApiAuthUser>>("/auth/me")
      .then((res) => setUser(authUserFromApi(res.data)))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const res = await apiFetch<ApiEnvelope<{ accessToken: string; user: ApiAuthUser }>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ EMAIL: email, PASSWORD: senha }),
    })
    setToken(res.data.accessToken)
    setUser(authUserFromApi(res.data.user))
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
