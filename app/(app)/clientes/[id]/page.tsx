"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Copy,
  FolderOpen,
  Mail,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StageBadge, PriorityBadge } from "@/components/badges"
import { useStore } from "@/lib/store"
import { formatCurrency, formatDate } from "@/lib/data"

export default function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { clients, orders, loading } = useStore()
  const cliente = clients.find((c) => c.id === id)
  const { clientFiles, loadClientFiles, addClientFile, removeClientFile } = useStore()
  const [novoNome, setNovoNome] = useState("")
  const [novoFormato, setNovoFormato] = useState("")
  const [copiado, setcopiado] = useState(false)

  useEffect(() => {
    if (cliente) loadClientFiles(cliente.id)
  }, [cliente?.id, loadClientFiles])

  const arquivosCliente = clientFiles[id] ?? []

  async function handleAddArquivo() {
    if (!novoNome.trim() || !novoFormato) return
    await addClientFile(id, { nome: novoNome, formato: novoFormato })
    setNovoNome("")
    setNovoFormato("")
  }

  async function handleCopiarPasta() {
    if (!cliente) return
    await navigator.clipboard.writeText(cliente.pasta)
    setcopiado(true)
    setTimeout(() => setcopiado(false), 1500)
  }

  if (!cliente) {
    if (loading) return null
    return notFound()
  }

  const pedidos = orders.filter((o) => o.clienteId === cliente.id)
  const arquivosProducao = pedidos.flatMap((o) =>
    o.arquivosProducao.map((a) => ({ ...a, pedido: o.numero })),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clientes"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-accent text-accent-foreground">
              {cliente.nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{cliente.nome}</h2>
            <p className="text-sm text-muted-foreground">{cliente.contato}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contato</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              {cliente.email}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              {cliente.telefone}
            </span>
            <span className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="truncate font-mono text-xs flex-1">{cliente.pasta}</span>
              <button
                type="button"
                onClick={handleCopiarPasta}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Copiar caminho da pasta"
              >
                {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </span>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Arquivos de produção ({arquivosProducao.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {arquivosProducao.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {arquivosProducao.map((a, i) => (
                  <div
                    key={`${a.pedido}-${a.nome}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-[10px] font-semibold text-muted-foreground">
                      {a.formato}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-foreground">{a.nome}</span>
                      <span className="text-[11px] text-muted-foreground">{a.pedido}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum arquivo de produção cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos do cliente ({pedidos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {pedidos.map((o) => (
              <Link
                key={o.id}
                href={`/pedidos/${o.id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-secondary/50"
              >
                <span className="w-14 shrink-0 text-sm font-medium text-muted-foreground">{o.numero}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{o.titulo}</span>
                <PriorityBadge prioridade={o.prioridade} />
                <StageBadge stage={o.stage} />
                <span className="hidden w-24 text-right text-sm text-muted-foreground sm:block">
                  {formatDate(o.prazo)}
                </span>
                <span className="hidden w-24 text-right text-sm font-medium tabular-nums md:block">
                  {formatCurrency(o.valor)}
                </span>
              </Link>
            ))}
            {pedidos.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhum pedido para este cliente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
