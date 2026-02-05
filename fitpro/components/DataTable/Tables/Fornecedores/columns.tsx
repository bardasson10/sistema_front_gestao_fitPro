import { Button } from "@/components/ui/button";
import {  Fornecedor } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";



export const getFornecedoresColumns = (
  onEdit: (item: Fornecedor) => void, 
  onRemove: (id: string) => void,
): ColumnDef<Fornecedor>[] => [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.tipo}</span>,
  },
  {
    accessorKey: 'contato',
    header: 'Contato',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.contato}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado Em',
    cell: ({ row }) => <span className="text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString('pt-BR')}</span>,
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