import { Button } from "@/components/ui/button";
import { Colaborador } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";



export const getColaboradoresColumns = (
  onEdit: (item: Colaborador) => void, 
  onRemove: (id: string) => void,
): ColumnDef<Colaborador>[] => [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
  },
  {
    accessorKey: 'funcao',
    header: 'Função',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.funcao}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        row.original.status === 'ativo' ?
        <span className="text-green-500 font-medium">{row.original.status.toUpperCase()}</span> :
        row.original.status === 'inativo' ?
        <span className="text-red-500 font-medium">{row.original.status.toUpperCase()}</span> :
        null
      );
    },
  },
  {
    accessorKey: 'criadoEm',
    header: 'Criado Em',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.criadoEm.toDateString()}</span>,
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
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(row.original.id)}
      >
        <Trash className="h-4 w-4" />
      </Button>
      </div>
    ),

  },
];