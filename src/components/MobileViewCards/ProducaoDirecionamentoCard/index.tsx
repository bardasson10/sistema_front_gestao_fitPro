import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { ProducaoDirecionamentoItem } from "@/components/DataTable/Tables/ProducaoDirecionamento/columns";

interface MobileViewProducaoDirecionamentoProps {
  data: ProducaoDirecionamentoItem[];
  isLoading: boolean;
  onEdit: (item: ProducaoDirecionamentoItem) => void;
  onRemove: (id: string) => void;
}

export const MobileViewProducaoDirecionamento = ({
  data,
  isLoading,
  onEdit,
  onRemove,
}: MobileViewProducaoDirecionamentoProps) => {
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
      {data.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma produção em andamento
        </p>
      )}
      {data.map((item) => (
        <BaseCard
          key={item.id}
          title={`Lote ${item.loteCodigo}`}
          cardClassName="min-h-fit"
          headerClassName="pb-2"
          action={<StatusBadge status={item.statusType}>{item.statusLabel}</StatusBadge>}
          content={
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facção:</span>
                <span className="font-medium">{item.faccaoNome || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produtos:</span>
                <span className="font-medium">{item.totalPecas} peças</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saída:</span>
                <span className="font-medium">{dataFormatter(new Date(item.dataSaida))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  {item.prazoMedio} dias
                </span>
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