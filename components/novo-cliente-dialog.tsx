"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { useStore } from "@/lib/store"
import { ApiError } from "@/lib/api"

export function NovoClienteDialog() {
  const { addClient } = useStore()
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [contato, setContato] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [pasta, setPasta] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = nome && contato

  function reset() {
    setNome("")
    setContato("")
    setEmail("")
    setTelefone("")
    setPasta("")
    setError(null)
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await addClient({ nome, contato, email, telefone, pasta })
      reset()
      setOpen(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar cliente")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>Cadastre um novo cliente para vincular a pedidos.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@cliente.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pasta">Pasta</Label>
            <Input
              id="pasta"
              value={pasta}
              onChange={(e) => setPasta(e.target.value)}
              placeholder="Caminho da pasta de arquivos do cliente"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            Criar cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
