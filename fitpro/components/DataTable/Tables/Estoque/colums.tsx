import { Button } from "@/components/ui/button";
import { RoloTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { getColorPreview } from "../Tecido/colums";
import { StatusBadge } from "@/components/ui/status-badge";


export const getStockColumns = (
  onEdit: (item: RoloTecido) => void,
  tecidos: { id: string; cor: string; tipo: string }[]
): ColumnDef<RoloTecido>[] => [

    {
      accessorKey: 'identificacao',
      header: 'ID Rolo',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.identificacao}</span>,
    },
    {
      accessorKey: 'tecidoId',
      header: 'Tecido',
      cell: ({ row }) => {
        const tecido = tecidos.find(t => t.id === row.original.tecidoId);
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: getColorPreview(tecido!.cor) }}
            />
            <span>{tecido?.tipo} - {tecido?.cor}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'pesoKg',
      header: 'Peso (Kg)',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.pesoKg.toFixed(1)}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap = {
          disponivel: { label: 'Disponível', type: 'success' as const },
          reservado: { label: 'Reservado', type: 'warning' as const },
          utilizado: { label: 'Utilizado', type: 'neutral' as const },
        };
        const status = statusMap[row.original.status];
        return <StatusBadge status={status.type}>{status.label}</StatusBadge>
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button> */}
        </div>
      ),

    },
  ];