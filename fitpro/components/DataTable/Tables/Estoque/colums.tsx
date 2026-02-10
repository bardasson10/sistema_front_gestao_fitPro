import { Button } from "@/components/ui/button";
import { EstoqueTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";


export const getStockColumns = (
  onEdit: (item: EstoqueTecido) => void,
  tecidos: { id: string; tipo: string; corId: string }[],
  cores: { id: string; nome: string; codigoHex: string }[],
): ColumnDef<EstoqueTecido>[] => [

    {
      accessorKey: 'identificacao',
      header: 'ID Rolo',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.codigoBarraRolo}</span>,
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
              style={{ backgroundColor: cores.find(c => c.id === tecido?.corId)?.codigoHex || '' }}
            />
            <span>{tecido?.tipo} - {cores.find(c => c.id === tecido?.corId)?.nome}</span>
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'pesoInicialKg',
    //   header: 'Peso Inicial (Kg)',
    //   cell: ({ row }) => <span className="text-muted-foreground">{row.original.pesoInicialKg}</span>,
    // },
    {
      accessorKey: 'pesoAtualKg',
      header: 'Peso Atual (Kg)',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.pesoAtualKg}</span>,
    },
    {
      accessorKey: 'situacao',
      header: 'Situação',
      cell: ({ row }) => {
        const statusMap = {
          disponivel: { label: 'Disponível', type: 'success' as const },
          reservado: { label: 'Reservado', type: 'warning' as const },
          utilizado: { label: 'Utilizado', type: 'neutral' as const },
        };
        const status = statusMap[row.original.situacao as keyof typeof statusMap];
        return <StatusBadge status={status.type}>{status.label}</StatusBadge>
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de Criação',
      cell: ({ row }) => <span className="text-muted-foreground">{dataFormatter(row.original.createdAt)}</span>,
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