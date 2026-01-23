import { ColumnDef } from "@tanstack/react-table";
import { GradeProduto } from "@/types/production"; // Ajuste seu import
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";


const InputCell = ({ index, fieldName }: { index: number, fieldName: string }) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={`grade.${index}.${fieldName}`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              type="number"
              min={0}
              className="h-8 w-16 text-center mx-auto" 
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const TotalCell = ({ index }: { index: number }) => {
  const { watch } = useFormContext();
  const rowData = watch(`grade.${index}`);
  const total = rowData
    ? (Number(rowData.gradePP || 0) +
      Number(rowData.gradeP || 0) +
      Number(rowData.gradeM || 0) +
      Number(rowData.gradeG || 0) +
      Number(rowData.gradeGG || 0))
    : 0;

  return <div className="text-center font-bold text-primary">{total}</div>;
};

export const getGradeDetalhadaColumns = (
  viewOnRemove?: boolean,
  onRemove?: (index: number) => void
): ColumnDef<GradeProduto>[] => {
  const columns: ColumnDef<GradeProduto>[] = [
    {
      accessorKey: 'produto',
      header: 'Produto',
      cell: ({ row }) => <span className="font-medium capitalize pl-2">{row.original.produto}</span>,
    },
    {
      accessorKey: 'gradePP',
      header: () => <div className="text-center w-16">PP</div>,
      cell: ({ row }) => <InputCell index={row.index} fieldName="gradePP" />,
    },
    {
      accessorKey: 'gradeP',
      header: () => <div className="text-center w-16">P</div>,
      cell: ({ row }) => <InputCell index={row.index} fieldName="gradeP" />,
    },
    {
      accessorKey: 'gradeM',
      header: () => <div className="text-center w-16">M</div>,
      cell: ({ row }) => <InputCell index={row.index} fieldName="gradeM" />,
    },
    {
      accessorKey: 'gradeG',
      header: () => <div className="text-center w-16">G</div>,
      cell: ({ row }) => <InputCell index={row.index} fieldName="gradeG" />,
    },
    {
      accessorKey: 'gradeGG',
      header: () => <div className="text-center w-16">GG</div>,
      cell: ({ row }) => <InputCell index={row.index} fieldName="gradeGG" />,
    },
    {
      id: 'total',
      header: () => <div className="text-center font-bold">Total</div>,
      cell: ({ row }) => <TotalCell index={row.index} />,
    },
  ];

  if (viewOnRemove) {
    columns.push({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove && onRemove(row.index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    });
  }

  return columns;
};