import { Button } from "@/components/ui/button";
import {  Faccao } from "@/types/production";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";



export const getFaccoesColumns = (
  onEdit: (item: Faccao) => void, 
  onRemove: (id: string) => void,
): ColumnDef<Faccao>[] => [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
  },
  {
    accessorKey: 'funcao',
    header: 'Função',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.responsavel}</span>,
  },
  {
    accessorKey: 'contato',
    header: 'Contato',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.contato}</span>,
  },
  {
    accessorKey: 'prazoMedio',
    header: 'Prazo Médio',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.prazoMedioDias}</span>,
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
    accessorKey: 'createdAt',
    header: 'Criado Em',
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