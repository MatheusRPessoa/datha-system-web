"use client"

import { useState } from "react"
import { Mail, Phone, User } from "lucide-react"
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
import { NovoFornecedorDialog } from "@/components/novo-fornecedor-dialog"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function FornecedoresPage() {
  const { suppliers } = useStore()
  const [q, setQ] = useState("")

  const filtered = suppliers.filter(
    (s) =>
      s.nome.toLowerCase().includes(q.toLowerCase()) ||
      s.categoria.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar fornecedor ou categoria"
          className="sm:max-w-xs"
        />
        <div className="sm:ml-auto">
          <NovoFornecedorDialog />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="hidden lg:table-cell">E-mail</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">{s.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{s.categoria}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {s.contato}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {s.telefone}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {s.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        s.status === "ativo"
                          ? "bg-chart-2/15 text-chart-2"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {s.status === "ativo" ? "Ativo" : "Inativo"}
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
