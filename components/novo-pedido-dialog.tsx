"use client"

import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { ApiError } from "@/lib/api"
import { priorityLabels, FILE_FORMATS } from "@/lib/data"

export function NovoPedidoDialog() {
  const { clients, users, addOrder, clientFiles, loadClientFiles } = useStore()
  const [open, setOpen] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [responsavel, setResponsavel] = useState("")
  const [prioridade, setPrioridade] = useState<"baixa" | "media" | "alta">("media")
  const [prazo, setPrazo] = useState("")
  const [valor, setValor] = useState("")
  const [itens, setItens] = useState<{ descricao: string; quantidade: string; unidade: string }[]>([
    { descricao: "", quantidade: "1", unidade: "un" },
  ])
  const [observacoes, setObservacoes] = useState("")
  const [arquivos, setArquivos] = useState<{ nome: string; formato: string; itemIndex?: number }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = numeroPedido && clienteId && responsavel && itens.some((i) => i.descricao.trim())

  useEffect(() => {
    if (clienteId) loadClientFiles(clienteId)
  }, [clienteId, loadClientFiles])

  const arquivosDoCliente = clientFiles[clienteId] ?? []

  function reset() {
    setNumeroPedido("")
    setClienteId("")
    setResponsavel("")
    setPrioridade("media")
    setPrazo("")
    setValor("")
    setItens([{ descricao: "", quantidade: "1", unidade: "un" }])
    setObservacoes("")
    setArquivos([])
    setError(null)
  }

  function addArquivo() {
    setArquivos((prev) => [...prev, { nome: "", formato: "" }])
  }

  function updateArquivo(index: number, field: "nome" | "formato" | "itemIndex", value: string) {
    setArquivos((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, [field]: field === "itemIndex" ? (value === "" ? undefined : Number(value)) : value } : a,
      ),
    )
  }

  function removeArquivo(index: number) {
    setArquivos((prev) => prev.filter((_, i) => i !== index))
  }

  function addItem() {
    setItens((prev) => [...prev, { descricao: "", quantidade: "1", unidade: "un" }])
  }
  
  function updateItem(index: number, field: "descricao" | "quantidade" | "unidade", value: string) {
    const sanitized = field === "quantidade" ? value.replace(/-/g, "") : value
    setItens((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: sanitized } : it)))
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!canSubmit) return
    const cliente = clients.find((c) => c.id === clienteId)
    const numero = numeroPedido.trim().startsWith("#") ? numeroPedido.trim() : `#${numeroPedido.trim()}`
    setError(null)
    setSubmitting(true)
    try {
      await addOrder({
        numero,
        titulo: itens[0]?.descricao ?? "",
        clienteId,
        cliente: cliente?.nome ?? "",
        stage: "atendimento",
        responsavel,
        prioridade,
        prazo: prazo || new Date().toISOString().slice(0, 10),
        valor: Number(valor) || 0,
        observacoes: observacoes || undefined,
        itens: itens
          .filter((i) => i.descricao.trim())
          .map((i) => ({ descricao: i.descricao, quantidade: Number(i.quantidade) || 1, unidade: i.unidade || "un"})),
        arquivosProducao: arquivos.filter((a) => a.nome.trim()),
        statusCompraMaterial: "pendente",
        compraMaterial: null,
      })
      reset()
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar pedido")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo pedido</DialogTitle>
          <DialogDescription>
            O pedido inicia na etapa Atendimento e segue o fluxo de produção.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="numeroPedido">Nº do Pedido</Label>
            <Input
              id="numeroPedido"
              value={numeroPedido}
              onChange={(e) => setNumeroPedido(e.target.value)}
              placeholder="Ex.: 1042"
            />
          </div>

          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select
              value={clienteId}
              onValueChange={(v) => setClienteId(v ?? "")}
              items={Object.fromEntries(clients.map((c) => [c.id, c.nome]))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Select value={responsavel} onValueChange={(v) => setResponsavel(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter((u) => u.ativo).map((u) => (
                    <SelectItem key={u.id} value={u.nome}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Prioridade</Label>
              <Select
                value={prioridade}
                onValueChange={(v) => setPrioridade(v as typeof prioridade)}
                items={priorityLabels}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="prazo">Prazo</Label>
              <Input id="prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="item">Produto</Label>
            <div className="flex flex-col gap-2">
              {itens.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={it.descricao}
                    onChange={(e) => updateItem(i, "descricao", e.target.value)}
                    placeholder="Ex.: Camisa 100% Algodão - Personalização frente"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={it.quantidade}
                    onChange={(e) => updateItem(i, "quantidade", e.target.value)}
                    placeholder="Qtd."
                    className="w-20 text-right"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon-sm" 
                    onClick={() => removeItem(i)} 
                    aria-label="Remover produto"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="self-start text-xs font-medium text-primary hover:underline">
                + Adicionar produto
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Arquivo(s) para montagem</Label>
            <p className="text-xs text-muted-foreground">
              Nome e formato dos arquivos enviados pelo cliente, salvos na pasta de ajustes, para quem for montar
              localizar e preparar a arte.
            </p>
            {arquivosDoCliente.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {arquivosDoCliente.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setArquivos((prev) => [...prev, { nome: f.nome, formato: f.formato}])}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary"
                  >
                    + {f.nome} ({f.formato})
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {arquivos.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={a.nome}
                    onChange={(e) => updateArquivo(i, "nome", e.target.value)}
                    placeholder="Nome do arquivo (ex.: logo-cliente.ai)"
                    className="flex-1"
                  />
                  <Select
                    value={a.itemIndex !== undefined ? String(a.itemIndex) : ""}
                    onValueChange={(v) => updateArquivo(i, "itemIndex", v ?? "")}
                    items={Object.fromEntries(
                      itens.map((it, idx) => [String(idx), it.descricao || `Item ${idx + 1}`]),
                    )}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Geral" />
                    </SelectTrigger>
                    <SelectContent>
                      {itens.map((it, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {it.descricao || `Item ${idx + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={a.formato}
                    onValueChange={(v) => updateArquivo(i, "formato", v ?? "")}
                    items={Object.fromEntries(FILE_FORMATS.map((f) => [f, f]))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => removeArquivo(i)}
                    aria-label="Remover arquivo"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={addArquivo}
                className="self-start text-xs font-medium text-primary hover:underline"
              >
                + Adicionar arquivo
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="obs">Observações</Label>
            <Input
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Detalhes importantes para a produção"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            Criar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
