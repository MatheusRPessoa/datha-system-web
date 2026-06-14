"use client"

import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/lib/auth"
import { roleLabels } from "@/lib/data"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/kanban": "Kanban — Etapas do pedido",
  "/pedidos": "Pedidos",
  "/clientes": "Clientes",
  "/fornecedores": "Fornecedores",
  "/usuarios": "Usuários",
}

export function Topbar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const title =
    Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "dathasystem"

  const iniciais = user
    ? user.nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : ""

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <MobileNav />
      <h1 className="text-base font-semibold text-foreground md:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido, cliente..."
            className="w-56 pl-9"
            aria-label="Buscar"
          />
        </div>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col leading-tight lg:flex">
            <span className="text-sm font-medium text-foreground">{user?.nome}</span>
            <span className="text-xs text-muted-foreground">{user ? roleLabels[user.role] : ""}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
