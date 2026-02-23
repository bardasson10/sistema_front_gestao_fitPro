import { BaseCard } from "@/components/MobileViewCards/base-card";
import { Button } from "@/components/ui/button";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { Produto, TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { Pencil, Trash2 } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface MobileViewProdutoProps {
  produtos: Produto[];
  tiposProduto: TiposProdutosSchema[];
  isLoading: boolean;
  onEdit: (item: Produto) => void;
  onRemove: (id: string) => void;
}

export const MobileViewProduto = ({
  produtos,
  tiposProduto,
  isLoading,
  onEdit,
  onRemove,
}: MobileViewProdutoProps) => {
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
      <SemDadosComponent<Produto> nomeDado="produto" data={produtos} />
      {Array.isArray(produtos) &&
        produtos.map((item) => {
          const tipoNome = item.tipo?.nome || tiposProduto.find((tipo) => tipo.id === item.tipoProdutoId)?.nome;

          return (
            <BaseCard
              key={item.id}
              title={item.nome}
              description={item.sku}
              cardClassName="min-h-fit"
              headerClassName="pb-2"
              content={
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{tipoNome || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fabricante:</span>
                    <span className="font-medium">{item.fabricante}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo médio:</span>
                    <span className="font-medium">{currencyFormatter.format(Number(item.custoMedioPeca) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço médio:</span>
                    <span className="font-medium">{currencyFormatter.format(Number(item.precoMedioVenda) || 0)}</span>
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
          );
        })}
    </div>
  );
};