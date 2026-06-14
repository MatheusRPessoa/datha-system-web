"use client"

import { useState } from "react"
import Link from "next/link"
import { FolderOpen, Printer, Package, Mail, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NovoClienteDialog } from "@/components/novo-cliente-dialog"
import { useStore } from "@/lib/store"

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

export default function ClientesPage() {
  const { clients, orders } = useStore()
  const [q, setQ] = useState("")

  const filtered = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(q.toLowerCase()) ||
      c.contato.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente"
          className="sm:max-w-xs"
        />
        <div className="sm:ml-auto">
          <NovoClienteDialog />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link key={c.id} href={`/clientes/${c.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {initials(c.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{c.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">{c.contato}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {c.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {c.telefone}
                  </span>
                  <span className="flex items-center gap-2 truncate">
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-mono text-xs">{c.pasta}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 border-t border-border pt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Printer className="h-3.5 w-3.5" />
                    {orders
                      .filter((o) => o.clienteId === c.id)
                      .reduce((sum, o) => sum + o.arquivosProducao.length, 0)}{" "}
                    arquivos
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {orders.filter((o) => o.clienteId === c.id && o.stage !== "entrega").length} ativos
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
