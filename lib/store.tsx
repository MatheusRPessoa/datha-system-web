"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import {
  clientFromApi,
  clientToCreateApi,
  orderFromApi,
  orderToCreateApi,
  orderToUpdateApi,
  productionFileToApi,
  supplierFromApi,
  supplierToCreateApi,
  userFromApi,
} from "@/lib/adapters"
import { useAuth } from "@/lib/auth"
import type { ApiClient, ApiOrder, ApiSupplier, ApiUser } from "@/lib/api-types"
import type { Client, MaterialStatus, Order, StageId, Supplier, User } from "@/lib/data"

type OrderPayload = Omit<Order, "id" | "logs" | "criadoEm" | "alocacoes">

type StoreContextValue = {
  orders: Order[]
  clients: Client[]
  suppliers: Supplier[]
  users: User[]
  loading: boolean
  error: string | null
  moveOrder: (orderId: string, stage: StageId) => Promise<void>
  alocarEtapa: (orderId: string, stage: StageId) => Promise<void>
  finalizarEtapa: (orderId: string, stage: StageId) => Promise<void>
  addOrder: (order: OrderPayload) => Promise<void>
  updateOrder: (orderId: string, updates: OrderPayload) => Promise<void>
  deleteOrder: (orderId: string) => Promise<void>
  atualizarCompraMaterial: (
    orderId: string,
    status: MaterialStatus,
    compra?: { fornecedorId: string; fornecedor: string; valor: number },
  ) => Promise<void>
  refreshOrder: (orderId: string) => Promise<void>
  addClient: (client: Omit<Client, "id">) => Promise<void>
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<void>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    Promise.all([
      apiFetch<ApiOrder[]>("/orders"),
      apiFetch<ApiClient[]>("/clients"),
      apiFetch<ApiSupplier[]>("/suppliers"),
      apiFetch<ApiUser[]>("/users"),
    ])
      .then(([ordersRes, clientsRes, suppliersRes, usersRes]) => {
        if (!active) return
        setOrders(ordersRes.map(orderFromApi))
        setClients(clientsRes.map(clientFromApi))
        setSuppliers(suppliersRes.map(supplierFromApi))
        setUsers(usersRes.map(userFromApi))
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const replaceOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id)
      if (idx === -1) return [order, ...prev]
      const next = [...prev]
      next[idx] = order
      return next
    })
  }, [])

  const refreshOrder = useCallback(
    async (orderId: string) => {
      const res = await apiFetch<ApiOrder>(`/orders/${orderId}`)
      replaceOrder(orderFromApi(res))
    },
    [replaceOrder],
  )

  const moveOrder = useCallback(
    async (orderId: string, stage: StageId) => {
      await apiFetch(`/orders/${orderId}/move`, {
        method: "POST",
        body: JSON.stringify({ STAGE: stage }),
      })
      await refreshOrder(orderId)
    },
    [refreshOrder],
  )

  const alocarEtapa = useCallback(
    async (orderId: string, stage: StageId) => {
      if (!user) return
      await apiFetch(`/orders/${orderId}/alocar`, {
        method: "POST",
        body: JSON.stringify({ STAGE: stage, USER_ID: user.id }),
      })
      await refreshOrder(orderId)
    },
    [refreshOrder, user],
  )

  const finalizarEtapa = useCallback(
    async (orderId: string, stage: StageId) => {
      if (!user) return
      await apiFetch(`/orders/${orderId}/finalizar`, {
        method: "POST",
        body: JSON.stringify({ STAGE: stage, USER_ID: user.id }),
      })
      await refreshOrder(orderId)
    },
    [refreshOrder, user],
  )

  const addOrder = useCallback(async (order: OrderPayload) => {
    const created = await apiFetch<ApiOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderToCreateApi(order)),
    })

    for (const arquivo of order.arquivosProducao) {
      if (!arquivo.nome.trim()) continue
      await apiFetch(`/orders/${created.ID}/arquivos`, {
        method: "POST",
        body: JSON.stringify(productionFileToApi(arquivo)),
      })
    }

    const full = await apiFetch<ApiOrder>(`/orders/${created.ID}`)
    setOrders((prev) => [orderFromApi(full), ...prev])
  }, [])

  const updateOrder = useCallback(
    async (orderId: string, updates: OrderPayload) => {
      await apiFetch(`/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(orderToUpdateApi(updates)),
      })

      const current = orders.find((o) => o.id === orderId)
      const nextIds = new Set(updates.arquivosProducao.map((a) => a.id).filter(Boolean))

      for (const arquivo of current?.arquivosProducao ?? []) {
        if (arquivo.id && !nextIds.has(arquivo.id)) {
          await apiFetch(`/orders/arquivos/${arquivo.id}`, { method: "DELETE" })
        }
      }
      for (const arquivo of updates.arquivosProducao) {
        if (!arquivo.id && arquivo.nome.trim()) {
          await apiFetch(`/orders/${orderId}/arquivos`, {
            method: "POST",
            body: JSON.stringify(productionFileToApi(arquivo)),
          })
        }
      }

      await refreshOrder(orderId)
    },
    [orders, refreshOrder],
  )

  const deleteOrder = useCallback(async (orderId: string) => {
    await apiFetch(`/orders/${orderId}`, { method: "DELETE" })
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
  }, [])

  const atualizarCompraMaterial = useCallback(
    async (
      orderId: string,
      status: MaterialStatus,
      compra?: { fornecedorId: string; fornecedor: string; valor: number },
    ) => {
      const body: Record<string, unknown> = { STATUS: status }
      if (status === "comprado" && compra) {
        body.FORNECEDOR_ID = compra.fornecedorId
        body.VALOR = compra.valor
      }
      await apiFetch(`/orders/${orderId}/compra-material`, {
        method: "POST",
        body: JSON.stringify(body),
      })
      await refreshOrder(orderId)
    },
    [refreshOrder],
  )

  const addClient = useCallback(async (client: Omit<Client, "id">) => {
    const created = await apiFetch<ApiClient>("/clients", {
      method: "POST",
      body: JSON.stringify(clientToCreateApi(client)),
    })
    setClients((prev) => [...prev, clientFromApi(created)])
  }, [])

  const addSupplier = useCallback(async (supplier: Omit<Supplier, "id">) => {
    const created = await apiFetch<ApiSupplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierToCreateApi(supplier)),
    })
    setSuppliers((prev) => [...prev, supplierFromApi(created)])
  }, [])

  const value = useMemo(
    () => ({
      orders,
      clients,
      suppliers,
      users,
      loading,
      error,
      moveOrder,
      alocarEtapa,
      finalizarEtapa,
      addOrder,
      updateOrder,
      deleteOrder,
      atualizarCompraMaterial,
      refreshOrder,
      addClient,
      addSupplier,
    }),
    [
      orders,
      clients,
      suppliers,
      users,
      loading,
      error,
      moveOrder,
      alocarEtapa,
      finalizarEtapa,
      addOrder,
      updateOrder,
      deleteOrder,
      atualizarCompraMaterial,
      refreshOrder,
      addClient,
      addSupplier,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider")
  return ctx
}
