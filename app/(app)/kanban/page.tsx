"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, ShoppingCart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PriorityBadge, MaterialStatusBadge } from "@/components/badges"
import { useStore } from "@/lib/store"
import {
  STAGES,
  nextStage,
  prevStage,
  formatDate,
  type Order,
} from "@/lib/data"
import { cn } from "@/lib/utils"

export default function KanbanPage() {
  const { orders, moveOrder } = useStore()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Acompanhe e mova os pedidos pelas etapas do fluxo em tempo real.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => {
          const items = orders.filter((o) => o.stage === stage.id)
          return (
            <div key={stage.id} className="flex flex-col gap-3">
              <div className={cn(stage.color, "stage-bg flex items-center justify-between rounded-lg px-3 py-2")}>
                <div className="flex items-center gap-2">
                  <span className="stage-dot h-2 w-2 rounded-full" />
                  <span className="stage-fg text-sm font-semibold">{stage.label}</span>
                </div>
                <span className="stage-fg rounded-full bg-card/60 px-2 text-xs font-medium tabular-nums">
                  {items.length}
                </span>
              </div>

              <div className="flex min-h-30 flex-col gap-3">
                {items.map((order) => (
                  <KanbanCard key={order.id} order={order} onMove={moveOrder} />
                ))}
                {items.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({
  order,
  onMove,
}: {
  order: Order
  onMove: (id: string, stage: Order["stage"]) => Promise<void>
}) {
  const prev = prevStage(order.stage)
  const next = nextStage(order.stage)

  return (
    <Card className="gap-0 p-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/pedidos/${order.id}`}
          className="text-sm font-semibold text-foreground hover:underline"
        >
          {order.numero}
        </Link>
        <PriorityBadge prioridade={order.prioridade} />
      </div>
      <Link href={`/pedidos/${order.id}`} className="mt-1 block">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{order.titulo}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{order.cliente}</p>
      </Link>

      <div className="mt-2 flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Prazo {formatDate(order.prazo)}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShoppingCart className="h-3 w-3" />
          Compra de material: <MaterialStatusBadge status={order.statusCompraMaterial} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
        <button
          onClick={() => prev && onMove(order.id, prev).catch(() => {})}
          disabled={!prev}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Voltar etapa"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="truncate text-[11px] text-muted-foreground">{order.responsavel}</span>
        <button
          onClick={() => next && onMove(order.id, next).catch(() => {})}
          disabled={!next}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Avançar etapa"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )
}
