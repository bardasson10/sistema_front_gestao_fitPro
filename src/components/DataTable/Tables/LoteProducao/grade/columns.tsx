import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GradeEditableRow {
  id: string;
  produtoId: string;
  produtoNome?: string;
  roloId: string;
  tamanhos: Record<string, number>;
}

interface TamanhoOption {
  id: string;
  nome: string;
}

interface ProdutoOption {
  id: string;
  nome: string;
}

interface RoloOption {
  id: string;
  codigoBarraRolo: string;
}

export function getGradeDetalhadaColumns(
  tamanhos: TamanhoOption[],
  produtos: ProdutoOption[],
  rolos: RoloOption[],
  onProdutoChange: (index: number, produtoId: string) => void,
  onQuantidadeChange: (index: number, tamanhoId: string, quantidade: number) => void,
  onRoloChange: (index: number, roloId: string) => void,
  onRemove?: (index: number) => void,
  isEditing?: boolean,
): ColumnDef<GradeEditableRow>[] {

  return [
    {
      id: "produto",
      header: "Produto",
      cell: ({ row }) =>
        isEditing ? (
          <Select
            value={row.original.produtoId || ""}
            onValueChange={(value) => onProdutoChange(row.index, value)}
          >
            <SelectTrigger className="w-55">
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map((produto) => (
                <SelectItem key={produto.id} value={produto.id}>
                  {produto.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{row.original.produtoNome || "-"}</span>
        ),
    },

    ...tamanhos.map((tamanho) => ({
      id: tamanho.id,
      header: () => (
        <div className="text-center w-16">{tamanho.nome}</div>
      ),
      cell: ({ row } : { row: any }) =>
        isEditing ? (
          <Input
            type="number"
            min={0}
            className="h-8 w-16 text-center"
            value={row.original.tamanhos[tamanho.id] ?? 0}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              onQuantidadeChange(
                row.index,
                tamanho.id,
                Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
              );
            }}
          />
        ) : (
          <div className="text-center">
            {row.original.tamanhos[tamanho.id] ?? 0}
          </div>
        ),
    })),

    {
      id: "total",
      header: () => <div className="text-center font-bold">Total</div>,
      cell: ({ row }) => {
        const total = tamanhos.reduce(
          (sum, tamanho) =>
            sum + Number(row.original.tamanhos[tamanho.id] || 0),
          0
        );

        return (
          <div className="text-center font-bold text-primary">
            {total}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        isEditing && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove?.(row.index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
    },
  ];
}