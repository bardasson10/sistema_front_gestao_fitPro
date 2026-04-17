import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  PackageCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusQualidadeConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  recebido: {
    label: "Recebido",
    className: "bg-primary/15 text-primary border-primary/30",
    icon: PackageCheck,
  },
  em_conferencia: {
    label: "Em Conferência",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
    icon: Clock,
  },
  aprovado: {
    label: "Aprovado",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
  aprovado_parcial: {
    label: "Aprovado Parcial",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
    icon: AlertTriangle,
  },
  aprovado_defeito: {
    label: "Aprovado Defeito",
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
    icon: AlertTriangle,
  },
}



export const StatusQualidadeBadge = ({ status }: { status: string }) => {
  const config = statusQualidadeConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground",
    icon: Clock,
  }
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}