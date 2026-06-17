// Tipos brutos retornados pelo backend NestJS (UPPER_SNAKE_CASE)

import type { MaterialStatus, Role, StageId } from "@/lib/data"

export type ApiBaseEntity = {
  ID: string
  STATUS: "ATIVO" | "INATIVO" | "EXCLUIDO"
  CRIADO_EM: string
  ATUALIZADO_EM: string
  EXCLUIDO_EM: string | null
}

export type ApiUser = ApiBaseEntity & {
  NOME: string
  EMAIL: string
  ROLE: Role
  SETOR: string
  ATIVO: boolean
}

export type ApiAuthUser = {
  ID: string
  NOME: string
  EMAIL: string
  ROLE: Role
  SETOR: string
}

export type ApiClient = ApiBaseEntity & {
  NOME: string
  CONTATO: string
  EMAIL: string
  TELEFONE: string
  PASTA: string
}

export type ApiClientFile = ApiBaseEntity & {
  CLIENTE_ID: string
  NOME: string
  FORMATO: string
}

export type ApiSupplier = ApiBaseEntity & {
  NOME: string
  CATEGORIA: string
  CONTATO: string
  TELEFONE: string
  EMAIL: string
  ATIVO: boolean
}

export type ApiOrderItem = ApiBaseEntity & {
  ORDER_ID: string
  DESCRICAO: string
  QUANTIDADE: number
  UNIDADE: string
}

export type ApiOrderLog = ApiBaseEntity & {
  ORDER_ID: string
  QUEM: string
  ACAO: string
}

export type ApiProductionFile = ApiBaseEntity & {
  ORDER_ID: string
  NOME: string
  FORMATO: string
  ITEM_ID: string | null
}

export type ApiStageAllocation = ApiBaseEntity & {
  ORDER_ID: string
  STAGE: StageId
  ALOCADO_POR: string | null
  ALOCADO_POR_USUARIO: ApiUser | null
  ALOCADO_EM: string | null
  FINALIZADO_POR: string | null
  FINALIZADO_POR_USUARIO: ApiUser | null
  FINALIZADO_EM: string | null
}

export type ApiOrder = ApiBaseEntity & {
  NUMERO: string
  CLIENTE_ID: string
  CLIENTE?: ApiClient
  TITULO: string
  RESPONSAVEL: string
  STAGE: StageId
  PRIORIDADE: "baixa" | "media" | "alta"
  PRAZO: string
  VALOR: number | string
  OBSERVACOES: string | null
  STATUS_COMPRA_MATERIAL: MaterialStatus
  COMPRA_MATERIAL_FORNECEDOR_ID: string | null
  FORNECEDOR_COMPRA_MATERIAL?: ApiSupplier | null
  COMPRA_MATERIAL_FORNECEDOR: string | null
  COMPRA_MATERIAL_VALOR: number | string | null
  COMPRA_MATERIAL_DATA: string | null
  ITENS?: ApiOrderItem[]
  LOGS?: ApiOrderLog[]
  ARQUIVOS_PRODUCAO?: ApiProductionFile[]
  ALOCACOES?: ApiStageAllocation[]
}

export type ApiEnvelope<T> = {
  succeeded: boolean
  data: T
  message: string
}

export type ApiErrorBody = {
  succeeded: false
  data: null
  message: string
  error?: { statusCode: number; error: string; details?: unknown }
}
