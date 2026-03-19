import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; className: string }> = {
    pendente: {
        label: "Pendente",
        className: "bg-warning/15 text-warning-foreground border-warning/30",
    },
    em_producao: {
        label: "Em Produção",
        className: "bg-primary/15 text-primary border-primary/30",
    },
    concluido: {
        label: "Concluído",
        className: "bg-success/15 text-success border-success/30",
    },
    cancelado: {
        label: "Cancelado",
        className: "bg-destructive/15 text-destructive border-destructive/30",
    },
}

export const StatusBadge =({ status }: { status: string }) => {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}