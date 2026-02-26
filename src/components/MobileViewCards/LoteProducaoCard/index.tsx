import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { BaseCard } from "@/components/MobileViewCards/base-card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao"
import { dataFormatter } from "@/utils/Formatter/data-brasil-format"
import { Eye, Package, User, Calendar, FileText } from "lucide-react"

interface MobileViewLoteProducaoProps {
  lotesProducao: ApiLoteProducaoResponse[]
  isLoading: boolean
  onView: (item: ApiLoteProducaoResponse) => void
}

export const MobileViewLoteProducao = ({
  lotesProducao,
  isLoading,
  onView,
}: MobileViewLoteProducaoProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  const statusMap = {
    planejado: { label: 'Planejado', type: 'info' as const, cor: 'blue' },
    em_andamento: { label: 'Em Andamento', type: 'warning' as const, cor: 'yellow' },
    concluido: { label: 'Concluído', type: 'success' as const, cor: 'green' },
    cancelado: { label: 'Cancelado', type: 'danger' as const, cor: 'red' },
  };

  return (
    <div className="flex flex-col gap-3 py-3">
      <SemDadosComponent<ApiLoteProducaoResponse> nomeDado="lote de produção" data={lotesProducao} />
      {Array.isArray(lotesProducao) && lotesProducao.map((lote) => {
        const statusInfo = statusMap[lote.status as keyof typeof statusMap] || statusMap.planejado;
        const totalItems = lote.gradeLote?.length || 0;
        const totalPecas = lote.gradeLote?.reduce((acc, item) => acc + (item?.quantidadePlanejada || 0), 0) || 0;

        return (
          <BaseCard
            key={lote.id}
            title={
              <div className="flex items-center justify-between w-full">
                <span className="font-mono font-bold text-base">{lote.codigoLote}</span>
              </div>
            }
            cardClassName="min-h-fit shadow-sm"
            headerClassName="pb-3"
            content={
              <div className="grid gap-2.5 text-sm">
                <StatusBadge className={`font-mono text-md font-extrabold text-${statusInfo.cor}-600`} status={statusInfo.type}>{statusInfo.label}</StatusBadge>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Data:
                  </span>
                  <span className="font-semibold text-sm">
                    {dataFormatter(lote.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Responsável:
                  </span>
                  <span className="font-medium text-sm truncate max-w-[60%]">
                    {lote.responsavel?.nome || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-dashed">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Produtos:
                  </span>
                  <span className="font-semibold text-base text-primary">
                    {totalItems} tipos • {totalPecas} peças
                  </span>
                </div>

                {lote.observacao && (
                  <div className="flex items-start gap-2 pt-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {lote.observacao}
                    </span>
                  </div>
                )}
              </div>
            }
            footer={
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-sm font-medium"
                  onClick={() => onView(lote)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </div>
            }
            footerClassName="border-t bg-muted/30 px-4 py-3"
          />
        );
      })}
    </div>
  )
}
