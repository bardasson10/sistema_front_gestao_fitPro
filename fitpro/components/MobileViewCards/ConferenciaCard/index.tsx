import { BaseCard } from "@/components/MobileViewCards/base-card";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Conferencia } from "@/types/production";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Pencil, Trash2 } from "lucide-react";

interface MobileViewConferenciaProps {
  conferencias: Conferencia[];
  lotesMap: Record<string, string>;
  faccoesMap: Record<string, string>;
  isLoading: boolean;
  onEdit: (item: Conferencia) => void;
  onRemove: (id: string) => void;
}

export const MobileViewConferencia = ({
  conferencias,
  lotesMap,
  faccoesMap,
  isLoading,
  onEdit,
  onRemove,
}: MobileViewConferenciaProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<Conferencia> nomeDado="conferência" data={conferencias} />
      {Array.isArray(conferencias) &&
        conferencias.map((item) => (
          <BaseCard
            key={item.id}
            title={`Lote ${lotesMap[item.loteId] || "-"}`}
            cardClassName="min-h-fit"
            headerClassName="pb-2"
            content={
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{dataFormatter(new Date(item.dataConferencia))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="font-medium">
                    {item.tipoProducao === "faccao"
                      ? faccoesMap[item.faccaoId || ""] || "Facção"
                      : "Interna"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Divergência:</span>
                  <StatusBadge status={item.divergencia ? "danger" : "success"}>
                    {item.divergencia ? "Sim" : "Não"}
                  </StatusBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pagamento:</span>
                  <StatusBadge status={item.liberadoPagamento ? "success" : "neutral"}>
                    {item.liberadoPagamento ? "Liberado" : "Pendente"}
                  </StatusBadge>
                </div>
              </div>
            }
            footer={
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onRemove(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            }
            footerClassName="border-t 0 bg-muted/50 px-6 py-8"
          />
        ))}
    </div>
  );
};