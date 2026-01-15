import { Button } from "@/components/ui/button";
import { Tecido } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

// Função auxiliar movida para fora ou para um arquivo de utils
export const getColorPreview = (cor: string) => {
  const colorMap: Record<string, string> = {
    preto: '#1a1a1a', branco: '#ffffff', rosa: '#f472b6',
    marrom: '#92400e', azul: '#3b82f6', vermelho: '#ef4444',
    verde: '#22c55e', amarelo: '#eab308', roxo: '#a855f7', laranja: '#f97316',
  };
  return colorMap[cor.toLowerCase()] || '#6b7280';
};

export const getFabricColumns = (
  onEdit: (item: Tecido) => void, 
  onRemove: (id: string) => void,
  fornecedores: { id: string; nome: string }[]
): ColumnDef<Tecido>[] => [
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.tipo}</span>,
  },
  {
    accessorKey: 'cor',
    header: 'Cor',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div 
          className="h-4 w-4 rounded-full border" 
          style={{ backgroundColor: getColorPreview(row.original.cor) }} 
        />
        <span>{row.original.cor}</span>
      </div>
    ),
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
    accessorKey: 'rendimento',
    header: 'Rendimento',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.rendimento} m/{row.original.unidade}</span>,
  },
  {
    accessorKey: 'unidade',
    header: 'Unidade',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.unidade.toUpperCase()}</span>,
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