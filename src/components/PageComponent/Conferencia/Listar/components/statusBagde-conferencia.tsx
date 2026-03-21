import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusQualidadeConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  validando: {
    label: "Validando",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
    icon: Clock,
  },
  aprovado: {
    label: "Aprovado",
    className: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
  },
  reprovado: {
    label: "Reprovado",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
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