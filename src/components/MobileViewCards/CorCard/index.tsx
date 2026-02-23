import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Cor } from "@/types/production";
import { Pencil, Trash2 } from "lucide-react";

interface MobileViewCorProps {
  cores: Cor[];
  isLoading: boolean;
  onEdit: (item: Cor) => void;
  onRemove: (id: string) => void;
}

export const MobileViewCor = ({ cores, isLoading, onEdit, onRemove }: MobileViewCorProps) => {
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
      <SemDadosComponent<Cor> nomeDado="cor" data={cores} />
      {Array.isArray(cores) &&
        cores.map((item) => (
          <BaseCard
            key={item.id}
            title={item.nome}
            cardClassName="min-h-fit"
            headerClassName="pb-2"
            action={
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: item.codigoHex }}
                title={item.codigoHex}
              />
            }
            content={
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HEX:</span>
                  <span className="font-medium">{item.codigoHex}</span>
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