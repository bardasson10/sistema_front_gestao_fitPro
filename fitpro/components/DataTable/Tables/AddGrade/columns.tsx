import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Produto } from "@/hooks/queries/useProdutos";
import { NovoItemRow } from "./type-input-new-line";
import { ProdutoSelectCell } from "./Components/select-product";
import { TamanhoSelectCell } from "./Components/select-tamanho";
import { QuantidadeCell } from "./Components/input-qtd";

export function getAdicionarProdutoColumns(
  produtos: Produto[],
  onRemove?: (index: number) => void
): ColumnDef<NovoItemRow>[] {
  return [
    {
      id: "produto",
      header: "Produto",
      cell: ({ row }) => (
        <ProdutoSelectCell
          index={row.index}
          produtos={produtos}
        />
      )
    },
    {
      id: "tamanho",
      header: "Tamanho",
      cell: ({ row }) => (
        <TamanhoSelectCell
          index={row.index}
          produtos={produtos}
        />
      )
    },
    {
      id: "quantidade",
      header: "Qtd",
      cell: ({ row }) => (
        <QuantidadeCell index={row.index} />
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove?.(row.index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];
}