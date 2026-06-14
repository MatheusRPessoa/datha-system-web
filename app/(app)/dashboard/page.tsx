"use client"

import Link from "next/link"
import {
  Package,
  Users,
  Truck,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StageBadge, PriorityBadge } from "@/components/badges"
import { useStore } from "@/lib/store"
import { STAGES, formatCurrency, formatDate } from "@/lib/data"

export default function DashboardPage() {
  const { orders, clients, suppliers } = useStore()

  const ativos = orders.filter((o) => o.stage !== "entrega")
  const faturamento = orders.reduce((acc, o) => acc + o.valor, 0)

  const porEtapa = STAGES.map((s) => ({
    stage: s,
    count: orders.filter((o) => o.stage === s.id).length,
  }))
  const maxCount = Math.max(1, ...porEtapa.map((p) => p.count))

  const recentes = [...orders]
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
    .slice(0, 5)

  const stats = [
    { label: "Pedidos ativos", value: ativos.length, icon: Package, hint: "em produção" },
    { label: "Clientes", value: clients.length, icon: Users, hint: "cadastrados" },
    { label: "Fornecedores", value: suppliers.length, icon: Truck, hint: "ativos" },
    { label: "Faturamento", value: formatCurrency(faturamento), icon: Clock, hint: "total em pedidos" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 truncate text-2xl font-semibold text-foreground">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pedidos por etapa</CardTitle>
            <Link
              href="/kanban"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver Kanban <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {porEtapa.map(({ stage, count }) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <StageBadge stage={stage.id} />
                </div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`${stage.color} stage-bg h-full rounded-full`}
                    style={{ width: `${(count / maxCount) * 100}%`, minWidth: count ? "8%" : "0%" }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-medium tabular-nums text-foreground">
                  {count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo de etapas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentes.map((o) => (
              <Link
                key={o.id}
                href={`/pedidos/${o.id}`}
                className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-secondary/50"
              >
                <span className="w-14 shrink-0 text-sm font-medium text-muted-foreground">{o.numero}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{o.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.cliente}</p>
                </div>
                <div className="hidden sm:block">
                  <PriorityBadge prioridade={o.prioridade} />
                </div>
                <StageBadge stage={o.stage} />
                <span className="hidden w-24 text-right text-sm text-muted-foreground md:block">
                  {formatDate(o.prazo)}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
