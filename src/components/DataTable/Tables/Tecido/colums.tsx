import { Button } from "@/components/ui/button";
import { Tecido } from "@/types/production";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

// Função auxiliar movida para fora ou para um arquivo de utils
;

export const getFabricColumns = (
  onEdit: (item: Tecido) => void, 
  onRemove: (id: string) => void,
  fornecedores: { id: string; nome: string }[],
  cores: {id: string; nome: string; codigoHex: string }[]
): ColumnDef<Tecido>[] => [
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nome}</span>,
  },
  {
    accessorKey: 'codigoReferencia',
    header: 'Codigo Referência',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.codigoReferencia.toUpperCase()}</span>,
  },
  {
    accessorKey: 'corId',
    header: 'Cor',
    cell: ({ row }) => { 
      const cor = Array.isArray(cores) ? cores.find(c => c.id === row.original.corId) : null;
      return (
      <div className="flex items-center gap-2">
        <div 
          className="h-6 w-6 rounded-full border dark:border-green-50" 
          style={{ backgroundColor: cor?.codigoHex || '#FFFFFF' }} 
        />
        <span>{cor?.nome || '-'}</span>
      </div>
    )},
  },
  {
    accessorKey: 'fornecedorId',
    header: 'Fornecedor',
    cell: ({ row }) => {
      const fornecedor = fornecedores.find(f => f.id === row.original.fornecedorId);
      return <span className="text-muted-foreground">{fornecedor?.nome || '-'}</span>;
    },
  },
  {
    accessorKey: 'rendimentoMetroKg',
    header: 'Rendimento',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.rendimentoMetroKg} m/Kg</span>,
  },
  {
    accessorKey: 'larguraMetros',
    header: 'Largura (m)',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.larguraMetros} m</span>,
  },
  {
    accessorKey: 'gramatura',
    header: 'Gramatura',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.gramatura} g/m²</span>,
  },
  {
    accessorKey: 'valorPorKg',
    header: 'Valor por Kg',
    cell: ({ row }) => {
      const valor = Number(row.original.valorPorKg) || 0;
      return <span className="text-muted-foreground">R$ {valor.toFixed(2)}</span>;
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