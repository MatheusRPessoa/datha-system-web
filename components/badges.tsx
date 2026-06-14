import { stageMeta, priorityLabels, materialStatusLabels, type StageId, type Order, type MaterialStatus } from "@/lib/data"
import { cn } from "@/lib/utils"

export function StageBadge({ stage, className }: { stage: StageId; className?: string }) {
  const meta = stageMeta(stage)
  return (
    <span
      className={cn(
        meta.color,
        "stage-bg stage-fg inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      <span className="stage-dot h-1.5 w-1.5 rounded-full" />
      {meta.label}
    </span>
  )
}

export function PriorityBadge({ prioridade }: { prioridade: Order["prioridade"] }) {
  const styles: Record<Order["prioridade"], string> = {
    baixa: "bg-secondary text-secondary-foreground",
    media: "bg-accent text-accent-foreground",
    alta: "bg-destructive/10 text-destructive",
  }
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", styles[prioridade])}>
      {priorityLabels[prioridade]}
    </span>
  )
}

export function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  const styles: Record<MaterialStatus, string> = {
    pendente: "bg-accent text-accent-foreground",
    comprado: "bg-primary/10 text-primary",
    cancelado: "bg-destructive/10 text-destructive",
  }
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", styles[status])}>
      {materialStatusLabels[status]}
    </span>
  )
}
