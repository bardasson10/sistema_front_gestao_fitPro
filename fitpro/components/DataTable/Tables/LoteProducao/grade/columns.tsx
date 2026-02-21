// columns.ts

import { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { GradeRow } from "@/utils/Mapper/tamanho-helper";


const InputCell = ({
  index,
  tamanhoNome,
  tamanhoQtd,
  isEditing
}: {
  index: number;
  tamanhoNome: string;
  tamanhoQtd: number;
  isEditing?: boolean;
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`grade.${index}.tamanhos.${ tamanhoNome }`}
      defaultValue={tamanhoQtd}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              type="number"
              min={0}
              disabled={!isEditing}
              className="h-8 w-14 text-center"
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
export function getGradeDetalhadaColumns(
  tamanhos: { nome: string, quantidade: number }[],
  onRemove?: (index: number) => void,
  isEditing?: boolean
): ColumnDef<GradeRow>[] {
  return [
    {
      accessorKey: "produtoNome",
      header: "Produto"
    },

    ...tamanhos.map((tamanho) => ({
      id: tamanho.nome,
      header: () => (
        <div className="text-center w-16">{tamanho.nome}</div>
      ),
      cell: ({ row }: any) => (
        <InputCell
          index={row.index}
          tamanhoNome={tamanho.nome}
          tamanhoQtd={row.original.tamanhos[tamanho.nome] || 0}
          isEditing={isEditing}
        />
      )
    })),

    {
      id: "total",
      header: () => <div className="text-center font-bold">Total</div>,
      cell: ({ row }: any) => {
        const tamanhosRow = row.original.tamanhos;

        const total = Object.values(tamanhosRow).reduce(
          (sum: number, val: any) => sum + Number(val || 0),
          0
        );

        return (
          <div className="text-center font-bold text-primary">
            {total}
          </div>
        );
      }
    },

    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove?.(row.index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
}