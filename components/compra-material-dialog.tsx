"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Order } from "@/lib/data"

export function CompraMaterialDialog({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { suppliers, atualizarCompraMaterial } = useStore()
  const [fornecedorId, setFornecedorId] = useState(pedido.compraMaterial?.fornecedorId ?? "")
  const [valor, setValor] = useState(pedido.compraMaterial ? String(pedido.compraMaterial.valor) : "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = fornecedorId && valor

  async function handleConfirm() {
    if (!canSubmit) return
    const fornecedor = suppliers.find((s) => s.id === fornecedorId)
    setError(null)
    setSubmitting(true)
    try {
      await atualizarCompraMaterial(pedido.id, "comprado", {
        fornecedorId,
        fornecedor: fornecedor?.nome ?? "",
        valor: Number(valor) || 0,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao registrar compra de material")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar compra de material</DialogTitle>
          <DialogDescription>
            Informe o fornecedor e o valor da compra do material para este pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Fornecedor</Label>
            <Select
              value={fornecedorId}
              onValueChange={(v) => setFornecedorId(v ?? "")}
              items={Object.fromEntries(suppliers.map((s) => [s.id, s.nome]))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="valorCompra">Valor (R$)</Label>
            <Input
              id="valorCompra"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit || submitting}>
            Confirmar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
