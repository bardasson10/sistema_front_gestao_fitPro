import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { BaseCard } from "@/components/MobileViewCards/base-card"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { RoloTecido } from "@/types/production"
import { StockProps } from "@/types/StockComponents/stock-components"
import { Pencil } from "lucide-react"



export const MobileViewStock = ({
  rolos,
  tecidos,
  isLoading,
  onEdit,
}: StockProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }


  const statusMap = {
    disponivel: { label: 'Disponível', type: 'success' as const },
    reservado: { label: 'Reservado', type: 'warning' as const },
    utilizado: { label: 'Utilizado', type: 'neutral' as const },
  };
  
  

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<RoloTecido> nomeDado="tecido" data={rolos} />
      {rolos.map((item) => {
        const tecidoDoRolo = tecidos.find(t => t.id === item.tecidoId);
        
        // Busca o status específico deste rolo
        // const statusInfo = statusMap[item.status as keyof typeof statusMap] || statusMap.disponivel;
        return (
          <BaseCard
            key={item.id}
            // title={item.identificacao}
            cardClassName="min-h-fit"
            headerClassName="pb-2"
            action={
              <div
                key={tecidoDoRolo?.id}
                className="h-5 w-5 rounded-full border shadow-sm"
                style={{ backgroundColor: "" }}
                title={tecidoDoRolo?.cor}
              />

            }
            content={
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso:</span>
                  <span className="font-medium">
                    {/* {item.pesoKg.toFixed(1)} Kg */}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {/* <StatusBadge status={statusInfo.type}>{statusInfo.label}</StatusBadge> */}
                </div>
              </div>
            }
            footer={
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                {/* <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button> */}
              </div>
            }
            footerClassName="border-t 0 bg-muted/50 px-6 py-8"
          />
        );
      })}


    </div>
  )
}