"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { StageBadge, PriorityBadge } from "@/components/badges"
import { NovoPedidoDialog } from "@/components/novo-pedido-dialog"
import { EditarPedidoDialog } from "@/components/editar-pedido-dialog"
import { useStore } from "@/lib/store"
import { ApiError } from "@/lib/api"
import { STAGES, formatCurrency, formatDate, type Order } from "@/lib/data"

export default function PedidosPage() {
  const { orders, deleteOrder } = useStore()
  const [q, setQ] = useState("")
  const [stageFilter, setStageFilter] = useState("todas")
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchQ =
        !q ||
        o.titulo.toLowerCase().includes(q.toLowerCase()) ||
        o.cliente.toLowerCase().includes(q.toLowerCase()) ||
        o.numero.includes(q)
      const matchStage = stageFilter === "todas" || o.stage === stageFilter
      return matchQ && matchStage
    })
  }, [orders, q, stageFilter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, cliente ou número"
            className="pl-9"
          />
        </div>
        <Select
          value={stageFilter}
          onValueChange={(value) => setStageFilter(value ?? "todas")}
          items={{ todas: "Todas as etapas", ...Object.fromEntries(STAGES.map((s) => [s.id, s.label])) }}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as etapas</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NovoPedidoDialog />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-20">Nº</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Responsável</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="hidden sm:table-cell">Prazo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-12 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="cursor-pointer">
                  <TableCell className="font-medium text-muted-foreground">
                    <Link href={`/pedidos/${o.id}`} className="block">
                      {o.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/pedidos/${o.id}`} className="block font-medium text-foreground">
                      {o.titulo}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{o.cliente}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{o.responsavel}</TableCell>
                  <TableCell>
                    <PriorityBadge prioridade={o.prioridade} />
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={o.stage} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {formatDate(o.prazo)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(o.valor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" aria-label="Ações do pedido">
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingOrder(o)}>
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeletingOrder(o)}>
                          <Trash2 />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editingOrder && (
        <EditarPedidoDialog
          key={editingOrder.id}
          pedido={editingOrder}
          open={!!editingOrder}
          onOpenChange={(open) => !open && setEditingOrder(null)}
        />
      )}

      <Dialog
        open={!!deletingOrder}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingOrder(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir pedido</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o pedido {deletingOrder?.numero}? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingOrder(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deletingOrder) return
                try {
                  await deleteOrder(deletingOrder.id)
                  setDeletingOrder(null)
                  setDeleteError(null)
                } catch (err) {
                  setDeleteError(err instanceof ApiError ? err.message : "Erro ao excluir pedido")
                }
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
