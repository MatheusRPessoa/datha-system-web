// Tipos de domínio do dathasystem
// Espelham as entidades do backend NestJS + PostgreSQL (users, orders, clients, fornecedores, order_logs)

export type Role = "admin" | "atendimento" | "producao" | "acabamento" | "entrega"

export type StageId =
  | "atendimento"
  | "montagem"
  | "impressao"
  | "producao"
  | "acabamento"
  | "entrega"

export type StageMeta = {
  id: StageId
  label: string
  color: string // classe utilitária de cor (token chart)
  description: string
}

export const STAGES: StageMeta[] = [
  { id: "atendimento", label: "Atendimento", color: "stage-atendimento", description: "Recebimento e briefing do pedido" },
  { id: "montagem", label: "Montagem de arquivo", color: "stage-montagem", description: "Preparação de arte e arquivos" },
  { id: "impressao", label: "Impressão", color: "stage-impressao", description: "Processo de impressão" },
  { id: "producao", label: "Produção", color: "stage-producao", description: "Produção física do material" },
  { id: "acabamento", label: "Acabamento", color: "stage-acabamento", description: "Corte, dobra e finalização" },
  { id: "entrega", label: "Disponível para retirada", color: "stage-entrega", description: "Pronto para retirada ou logística" },
]

export function stageMeta(id: StageId): StageMeta {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export function nextStage(id: StageId): StageId | null {
  const idx = STAGES.findIndex((s) => s.id === id)
  if (idx < 0 || idx >= STAGES.length - 1) return null
  return STAGES[idx + 1].id
}

export function prevStage(id: StageId): StageId | null {
  const idx = STAGES.findIndex((s) => s.id === id)
  if (idx <= 0) return null
  return STAGES[idx - 1].id
}

export type User = {
  id: string
  nome: string
  email: string
  role: Role
  setor: string
  ativo: boolean
}

export type ProductionFile = {
  id?: string
  nome: string
  formato: string
}

export type Client = {
  id: string
  nome: string
  contato: string
  email: string
  telefone: string
  pasta: string
}

export type Supplier = {
  id: string
  nome: string
  categoria: string
  contato: string
  telefone: string
  email: string
  status: "ativo" | "inativo"
}

export type OrderItem = {
  descricao: string
  quantidade: number
  unidade: string
}

export type StageAllocation = {
  stage: StageId
  alocadoPor: string | null
  alocadoEm: string | null
  finalizadoPor: string | null
  finalizadoEm: string | null
}

export type OrderLog = {
  id: string
  data: string
  quem: string
  acao: string
}

export type MaterialStatus = "pendente" | "comprado" | "cancelado"

// Registro da compra do material quando statusCompraMaterial === "comprado"
export type MaterialPurchase = {
  fornecedorId: string
  fornecedor: string
  valor: number
  data: string // data da compra, gerada automaticamente
}

export type Order = {
  id: string
  numero: string
  cliente: string
  clienteId: string
  titulo: string
  stage: StageId
  responsavel: string
  prioridade: "baixa" | "media" | "alta"
  prazo: string
  criadoEm: string
  valor: number
  observacoes?: string
  itens: OrderItem[]
  // Arquivo(s) enviados pelo cliente, indicados pelo atendimento para a Montagem localizar e preparar
  arquivosProducao: ProductionFile[]
  statusCompraMaterial: MaterialStatus
  compraMaterial: MaterialPurchase | null
  alocacoes: StageAllocation[]
  logs: OrderLog[]
}

// Formatos de arquivo aceitos para os arquivos de montagem/produção
export const FILE_FORMATS = ["PDF", "PNG", "JPG", "CDR", "AI", "PS"] as const

export const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  atendimento: "Atendimento",
  producao: "Produção",
  acabamento: "Acabamento",
  entrega: "Entrega",
}

export const priorityLabels: Record<Order["prioridade"], string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
}

export const materialStatusLabels: Record<MaterialStatus, string> = {
  pendente: "Pendente",
  comprado: "Comprado",
  cancelado: "Cancelado",
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}
