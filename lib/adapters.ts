// Mapeamento entre o shape bruto da API (UPPER_SNAKE_CASE) e os tipos de domínio do frontend

import type {
  ApiAuthUser,
  ApiClient,
  ApiClientFile,
  ApiOrder,
  ApiOrderItem,
  ApiOrderLog,
  ApiProductionFile,
  ApiStageAllocation,
  ApiSupplier,
  ApiUser,
} from "@/lib/api-types"
import {
  ClientFile,
  formatDateTime,
  type Client,
  type MaterialPurchase,
  type Order,
  type OrderItem,
  type OrderLog,
  type ProductionFile,
  type StageAllocation,
  type Supplier,
  type User,
} from "@/lib/data"

export function userFromApi(u: ApiUser): User {
  return { id: u.ID, nome: u.NOME, email: u.EMAIL, role: u.ROLE, setor: u.SETOR, ativo: u.ATIVO }
}

export type AuthUser = {
  id: string
  nome: string
  email: string
  role: User["role"]
  setor: string
}

export function authUserFromApi(u: ApiAuthUser): AuthUser {
  return { id: u.ID, nome: u.NOME, email: u.EMAIL, role: u.ROLE, setor: u.SETOR }
}

export function clientFromApi(c: ApiClient): Client {
  return { id: c.ID, nome: c.NOME, contato: c.CONTATO, email: c.EMAIL, telefone: c.TELEFONE, pasta: c.PASTA }
}

export function clientToCreateApi(payload: Omit<Client, "id">) {
  return {
    NOME: payload.nome,
    CONTATO: payload.contato,
    EMAIL: payload.email,
    TELEFONE: payload.telefone,
    PASTA: payload.pasta,
  }
}

export function supplierFromApi(s: ApiSupplier): Supplier {
  return {
    id: s.ID,
    nome: s.NOME,
    categoria: s.CATEGORIA,
    contato: s.CONTATO,
    telefone: s.TELEFONE,
    email: s.EMAIL,
    status: s.ATIVO ? "ativo" : "inativo",
  }
}

export function supplierToCreateApi(payload: Omit<Supplier, "id">) {
  return {
    NOME: payload.nome,
    CATEGORIA: payload.categoria,
    CONTATO: payload.contato,
    TELEFONE: payload.telefone,
    EMAIL: payload.email,
    ATIVO: payload.status === "ativo",
  }
}

export function productionFileFromApi(f: ApiProductionFile): ProductionFile {
  return { id: f.ID, nome: f.NOME, formato: f.FORMATO, itemId: f.ITEM_ID }
}

export function clientFileFromApi(f: ApiClientFile): ClientFile {
  return { id: f.ID, clienteId: f.CLIENTE_ID, nome: f.NOME, formato: f.FORMATO }
}

export function clientFileToCreateApi(f: { nome: string; formato: string }) {
  return { NOME: f.nome, FORMATO: f.formato }
}

export function productionFileToApi(f: ProductionFile) {
  return { 
    NOME: f.nome, 
    FORMATO: f.formato, 
    ...(f.itemId ? { ITEM_ID: f.itemId }: {}),
  }
}

export function orderItemFromApi(i: ApiOrderItem): OrderItem {
  return { 
    id: i.ID,
    descricao: i.DESCRICAO, 
    quantidade: i.QUANTIDADE, 
    unidade: i.UNIDADE 
  }
}

export function orderItemToApi(i: OrderItem) {
  return {
    ...(i.id ? { ID: i.id }: {}), 
    DESCRICAO: i.descricao, 
    QUANTIDADE: i.quantidade, 
    UNIDADE: i.unidade 
  }
}

export function allocationFromApi(a: ApiStageAllocation): StageAllocation {
  return {
    stage: a.STAGE,
    alocadoPor: a.ALOCADO_POR_USUARIO?.NOME ?? null,
    alocadoEm: a.ALOCADO_EM ? formatDateTime(a.ALOCADO_EM) : null,
    finalizadoPor: a.FINALIZADO_POR_USUARIO?.NOME ?? null,
    finalizadoEm: a.FINALIZADO_EM ? formatDateTime(a.FINALIZADO_EM) : null,
  }
}

export function logFromApi(l: ApiOrderLog): OrderLog {
  return { id: l.ID, data: formatDateTime(l.CRIADO_EM), quem: l.QUEM, acao: l.ACAO }
}

export function orderFromApi(o: ApiOrder): Order {
  const compraMaterial: MaterialPurchase | null =
    o.STATUS_COMPRA_MATERIAL === "comprado"
      ? {
          fornecedorId: o.COMPRA_MATERIAL_FORNECEDOR_ID ?? "",
          fornecedor: o.COMPRA_MATERIAL_FORNECEDOR ?? "",
          valor: Number(o.COMPRA_MATERIAL_VALOR ?? 0),
          data: o.COMPRA_MATERIAL_DATA ?? "",
        }
      : null

  return {
    id: o.ID,
    numero: o.NUMERO,
    cliente: o.CLIENTE?.NOME ?? "",
    clienteId: o.CLIENTE_ID,
    titulo: o.TITULO,
    stage: o.STAGE,
    responsavel: o.RESPONSAVEL,
    prioridade: o.PRIORIDADE,
    prazo: o.PRAZO,
    criadoEm: o.CRIADO_EM.slice(0, 10),
    valor: Number(o.VALOR),
    observacoes: o.OBSERVACOES ?? undefined,
    itens: (o.ITENS ?? []).map(orderItemFromApi),
    arquivosProducao: (o.ARQUIVOS_PRODUCAO ?? []).map(productionFileFromApi),
    statusCompraMaterial: o.STATUS_COMPRA_MATERIAL,
    compraMaterial,
    alocacoes: (o.ALOCACOES ?? []).map(allocationFromApi),
    logs: (o.LOGS ?? []).map(logFromApi),
  }
}

type OrderPayload = Omit<Order, "id" | "logs" | "criadoEm" | "alocacoes">

export function orderToCreateApi(payload: OrderPayload) {
  return {
    NUMERO: payload.numero,
    CLIENTE_ID: payload.clienteId,
    TITULO: payload.titulo,
    RESPONSAVEL: payload.responsavel,
    PRIORIDADE: payload.prioridade,
    PRAZO: payload.prazo,
    VALOR: payload.valor,
    OBSERVACOES: payload.observacoes ?? null,
    ITENS: payload.itens.map(orderItemToApi),
  }
}

export function orderToUpdateApi(payload: OrderPayload) {
  return {
    CLIENTE_ID: payload.clienteId,
    TITULO: payload.titulo,
    RESPONSAVEL: payload.responsavel,
    PRIORIDADE: payload.prioridade,
    PRAZO: payload.prazo,
    VALOR: payload.valor,
    OBSERVACOES: payload.observacoes ?? null,
    ITENS: payload.itens.map(orderItemToApi),
  }
}
