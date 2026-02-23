import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Link2, Pencil, Trash2 } from "lucide-react";

interface MobileViewTiposProdutoProps {
  tiposProdutos: TiposProdutosSchema[];
  isLoading: boolean;
  onAssociate: (item: TiposProdutosSchema) => void;
  onEdit: (item: TiposProdutosSchema) => void;
  onRemove: (id: string) => void;
}

export const MobileViewTiposProduto = ({
  tiposProdutos,
  isLoading,
  onAssociate,
  onEdit,
  onRemove,
}: MobileViewTiposProdutoProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<TiposProdutosSchema> nomeDado="tipo de produto" data={tiposProdutos} />
      {Array.isArray(tiposProdutos) && tiposProdutos.map((item) => (
        <BaseCard
          key={item.id}
          title={item.nome}
          cardClassName="min-h-fit"
          headerClassName="pb-2"
          content={
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tamanhos:</span>
                <span className="font-medium text-right">
                  {item.tamanhos?.length
                    ? item.tamanhos.map((tamanho) => tamanho.NomeTamanho).join(", ")
                    : "Sem tamanhos"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span className="font-medium">{dataFormatter(item.createdAt)}</span>
              </div>
            </div>
          }
          footer={
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onAssociate(item)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Associar tamanhos
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(item)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemove(item.id)}
              >
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
