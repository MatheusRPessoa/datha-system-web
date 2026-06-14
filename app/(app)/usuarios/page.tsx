"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"
import { roleLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

export default function UsuariosPage() {
  const { users } = useStore()
  const [q, setQ] = useState("")

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(q.toLowerCase()) ||
      u.setor.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm text-accent-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Colaboradores e permissões por setor. O acesso é controlado por papel (role) via JWT.
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar colaborador ou setor"
        className="sm:max-w-xs"
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Colaborador</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="hidden sm:table-cell">Setor</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {u.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{u.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        u.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {roleLabels[u.role]}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{u.setor}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        u.ativo ? "text-chart-2" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          u.ativo ? "bg-chart-2" : "bg-muted-foreground",
                        )}
                      />
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
