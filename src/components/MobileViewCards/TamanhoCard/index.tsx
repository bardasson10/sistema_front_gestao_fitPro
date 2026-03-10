import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Tamanho } from "@/hooks/queries/useProdutos";
import { Pencil, Trash2 } from "lucide-react";

interface MobileViewTamanhoProps {
  tamanhos: Tamanho[];
  isLoading: boolean;
  onEdit: (item: Tamanho) => void;
  onRemove: (id: string) => void;
}

export const MobileViewTamanho = ({ tamanhos, isLoading, onEdit, onRemove }: MobileViewTamanhoProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-28 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<Tamanho> nomeDado="tamanho" data={tamanhos} />
      {Array.isArray(tamanhos) &&
        tamanhos.map((item) => (
          <BaseCard
            key={item.id}
            title={item.nome}
            cardClassName="min-h-fit"
            headerClassName="pb-2"
            content={
              <div className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordem:</span>
                  <span className="font-medium">{item.ordem}</span>
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
            footerClassName="border-t bg-muted/50 px-6 py-8"
          />
        ))}
    </div>
  );
};
