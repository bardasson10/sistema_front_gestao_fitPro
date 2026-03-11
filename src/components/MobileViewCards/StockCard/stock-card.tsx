import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { BaseCard } from "@/components/MobileViewCards/base-card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EstoqueRolo } from "@/hooks/queries/useEstoque"
import { EstoqueTecido } from "@/types/production"
import { StockProps } from "@/types/StockComponents/stock-components"
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format"
import { parseNumber } from "@/utils/Formatter/parse-number-format"
import { Pencil } from "lucide-react"



export const MobileViewStock = ({
  rolos,
  tecidos,
  cores,
  isLoading,
  onEdit,
}: StockProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }


  const statusMap = {
    disponivel: { label: 'Disponível', type: 'success' as const },
    reservado: { label: 'Reservado', type: 'warning' as const },
    em_uso: { label: 'Em Uso', type: 'neutral' as const },
    utilizado: { label: 'Utilizado', type: 'neutral' as const },
    descartado: { label: 'Descartado', type: 'danger' as const },
    esgotado: { label: 'Esgotado', type: 'danger' as const },
  };


  function calculateValorTotal(pesoAtualKg: number, valorPorKg: number ): number {
    return pesoAtualKg * valorPorKg;
  }
  
  

  return (
    <div className="flex flex-col gap-3 py-3">
      <SemDadosComponent<EstoqueRolo> nomeDado="tecido" data={rolos} />
      {Array.isArray(rolos) && rolos.map((item) => {
        const tecidoDoRolo = tecidos.find(t => t.id === item.tecidoId);
        
        const statusInfo = statusMap[item.situacao as keyof typeof statusMap] || statusMap.disponivel;
        return (
          <BaseCard
            key={item.id}
            title={tecidoDoRolo?.codigoReferencia || 'Tecido Desconhecido'}
            cardClassName="min-h-fit"
            headerClassName="pb-2"
            action={
              <div
                key={tecidoDoRolo?.id}
                className="h-5 w-5 rounded-full border shadow-sm"
                style={{ backgroundColor: cores.find(c => c.id === tecidoDoRolo?.corId)?.codigoHex || '' }}
                title={cores.find(c => c.id === tecidoDoRolo?.corId)?.nome || ''}
              />

            }
            content={
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso Inicial:</span>
                  <span className="font-medium">
                    {item.pesoInicialKg} Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso Atual:</span>
                  <span className="font-medium">
                    {item.pesoAtualKg} Kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={statusInfo.type}>{statusInfo.label}</StatusBadge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Tecido:</span>
                    <span className="font-medium">{formatNumberToBRL(item.tecido.valorPorKg)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-medium">{formatNumberToBRL(calculateValorTotal(parseNumber(item.pesoAtualKg), parseNumber(item.tecido.valorPorKg)))}</span>
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