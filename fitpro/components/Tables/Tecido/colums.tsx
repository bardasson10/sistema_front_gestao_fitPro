import { Button } from "@/components/ui/button";
import { Tecido } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export interface FabricColumnProps {
  item: Tecido;
  setEditingItem: React.Dispatch<React.SetStateAction<Tecido | null>>;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      tipo: string;
      cor: string;
      largura: number;
      rendimento: number;
      unidade: 'kg';
      fornecedorId: string;
    }>
  >;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fornecedores: { id: string; nome: string }[];
}



export const getColorPreview = (cor: string) => {
    const colorMap: Record<string, string> = {
      preto: '#1a1a1a',
      branco: '#ffffff',
      rosa: '#f472b6',
      marrom: '#92400e',
      azul: '#3b82f6',
      vermelho: '#ef4444',
      verde: '#22c55e',
      amarelo: '#eab308',
      roxo: '#a855f7',
      laranja: '#f97316',
    };
    return colorMap[cor.toLowerCase()] || '#6b7280';
  };


export const handleEdit = ({ item, setEditingItem, setFormData, setIsOpen }: Omit<FabricColumnProps, 'fornecedores'>) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      cor: item.cor,
      largura: item.largura,
      rendimento: item.rendimento,
      unidade: item.unidade,
      fornecedorId: item.fornecedorId,
    });
    setIsOpen(true);
  };

export const Fabriccolumns = ({ setEditingItem, setFormData, setIsOpen, fornecedores}: Omit<FabricColumnProps, 'item'>): ColumnDef<Tecido>[] => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.id}</span>
      ),

    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.tipo}</span>
      ),
    },
    {
      accessorKey: 'cor',
      header: 'Cor',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div 
            className="h-5 w-5 rounded-full border"
            style={{ backgroundColor: getColorPreview(row.original.cor) }}
          />
          <span>{row.original.cor}</span>
        </div>
      ),
    },
    {
      accessorKey: 'fornecedor',
      header: 'Fornecedor',
      cell: ({ row }) => {
        const fornecedor = fornecedores.find(f => f.id === row.original.fornecedorId);
        return <span className="text-muted-foreground">{fornecedor?.nome || '-'}</span>;
      },
    },
    {
      accessorKey: 'largura',
      header: 'Largura',
      cell: ({ row }) => (
        <span>{row.original.largura} cm</span>
      ),
    },
    {
      accessorKey: 'rendimento',
      header: 'Rendimento',
      cell: ({ row }) => (
        <span>{row.original.rendimento} m/kg</span>
      ),
    },
    {
      accessorKey: 'unidade',
      header: 'Unidade',
      cell: () => (
        <span className="uppercase text-muted-foreground">KG</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit({ item: row.original, 
              setEditingItem: 
              setEditingItem, 
              setFormData: 
              setFormData, 
              setIsOpen: setIsOpen });
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];