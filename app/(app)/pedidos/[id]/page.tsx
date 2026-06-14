"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StageBadge, PriorityBadge, MaterialStatusBadge } from "@/components/badges"
import { CompraMaterialDialog } from "@/components/compra-material-dialog"
import { useStore } from "@/lib/store"
import {
  STAGES,
  stageMeta,
  nextStage,
  prevStage,
  formatCurrency,
  formatDate,
  materialStatusLabels,
  type MaterialStatus,
} from "@/lib/data"
import { cn } from "@/lib/utils"

export default function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { orders, clients, loading, moveOrder, alocarEtapa, finalizarEtapa, atualizarCompraMaterial, refreshOrder } =
    useStore()
  const [compraDialogOpen, setCompraDialogOpen] = useState(false)

  useEffect(() => {
    refreshOrder(id).catch(() => {})
  }, [id, refreshOrder])

  const pedido = orders.find((o) => o.id === id)
  if (!pedido) {
    if (loading) return null
    return notFound()
  }

  const cliente = clients.find((c) => c.id === pedido.clienteId)

  const prev = prevStage(pedido.stage)
  const next = nextStage(pedido.stage)
  const alocAtual = pedido.alocacoes.find((a) => a.stage === pedido.stage)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pedidos"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {pedido.numero} · {pedido.titulo}
            </h2>
            <PriorityBadge prioridade={pedido.prioridade} />
          </div>
          <Link href={`/clientes/${pedido.clienteId}`} className="text-sm text-muted-foreground hover:underline">
            {pedido.cliente}
          </Link>
        </div>
        <StageBadge stage={pedido.stage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes do pedido</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Info label="Responsável" value={pedido.responsavel} />
            <Info
              label="Prazo"
              value={
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(pedido.prazo)}
                </span>
              }
            />
            <Info label="Criado em" value={formatDate(pedido.criadoEm)} />
            <Info label="Valor" value={formatCurrency(pedido.valor)} />
            {pedido.observacoes && <Info label="Observações" value={pedido.observacoes} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Itens</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pedido.itens.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{item.descricao}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {item.quantidade} {item.unidade}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compra de material</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <MaterialStatusBadge status={pedido.statusCompraMaterial} />
            <Select
              value={pedido.statusCompraMaterial}
              onValueChange={(v) => {
                if (!v) return
                if (v === "comprado") {
                  setCompraDialogOpen(true)
                  return
                }
                atualizarCompraMaterial(pedido.id, v as MaterialStatus).catch(() => {})
              }}
              items={materialStatusLabels}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="comprado">Comprado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pedido.compraMaterial ? (
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <Info label="Fornecedor" value={pedido.compraMaterial.fornecedor} />
              <Info label="Valor" value={formatCurrency(pedido.compraMaterial.valor)} />
              <Info label="Data da compra" value={formatDate(pedido.compraMaterial.data)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma compra de material registrada para este pedido.</p>
          )}
        </CardContent>
      </Card>

      <CompraMaterialDialog pedido={pedido} open={compraDialogOpen} onOpenChange={setCompraDialogOpen} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arquivos de produção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {cliente && (
            <span className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="truncate font-mono text-xs">{cliente.pasta}</span>
            </span>
          )}
          {pedido.arquivosProducao.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                Enviados pelo cliente para montagem. Após preparar a arte para impressão, salvar na pasta acima.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pedido.arquivosProducao.map((a) => (
                  <div
                    key={a.id ?? a.nome}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-[10px] font-semibold text-muted-foreground">
                      {a.formato}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                      {a.nome}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum arquivo de produção cadastrado para este pedido.</p>
          )}
          {cliente && (
            <Link href={`/clientes/${cliente.id}`} className="text-sm text-primary hover:underline">
              Ver arquivos de produção do cliente
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fluxo de produção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {STAGES.map((stage) => {
            const a = pedido.alocacoes.find((x) => x.stage === stage.id)
            const isCurrent = pedido.stage === stage.id
            const done = !!a?.finalizadoEm

            return (
              <div key={stage.id} className="flex gap-3">
                <div
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    done ? "bg-primary" : isCurrent ? cn(stage.color, "stage-dot") : "bg-border",
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent || done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {stage.label}
                    </span>
                    {isCurrent && <StageBadge stage={stage.id} />}
                  </div>
                  <div className="mt-1 flex flex-col text-xs text-muted-foreground">
                    {a?.alocadoPor && <span>Alocado por {a.alocadoPor} em {a.alocadoEm}</span>}
                    {a?.finalizadoPor && <span>Finalizado por {a.finalizadoPor} em {a.finalizadoEm}</span>}
                    {!a?.alocadoPor && <span>Pendente</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!prev}
            onClick={() => prev && moveOrder(pedido.id, prev).catch(() => {})}
          >
            <ChevronLeft />
            Etapa anterior
          </Button>

          {!alocAtual?.alocadoPor && (
            <Button
              size="sm"
              onClick={() => alocarEtapa(pedido.id, pedido.stage).catch(() => {})}
            >
              Alocar {stageMeta(pedido.stage).label}
            </Button>
          )}

          {alocAtual?.alocadoPor && !alocAtual?.finalizadoPor && (
            <Button
              size="sm"
              onClick={() => finalizarEtapa(pedido.id, pedido.stage).catch(() => {})}
            >
              Finalizar {stageMeta(pedido.stage).label}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={!next}
            onClick={() => next && moveOrder(pedido.id, next).catch(() => {})}
          >
            Próxima etapa
            <ChevronRight />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {pedido.logs
              .slice()
              .reverse()
              .map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <span className="w-24 shrink-0 text-muted-foreground">{log.data}</span>
                  <span className="min-w-0 flex-1 text-foreground">{log.acao}</span>
                  <span className="shrink-0 font-medium text-muted-foreground">{log.quem}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
