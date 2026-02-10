import { Button } from "@/components/ui/button";
import { LoteProducao } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";


export const getLoteProducaoColumns = (
  onView: (item: LoteProducao) => void,
): ColumnDef<LoteProducao>[] => [
  {
    accessorKey: 'codigoLote',
    header: 'Código',
    cell: ({ row }) => <span className="font-bold">{row.original.codigoLote}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Data',
    cell: ({ row }) => {
      const data = row.original.createdAt;
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      return <span>{dataObj.toLocaleDateString('pt-BR')}</span>;
    },
  },
  {
    id: 'tecidos',
    header: 'Tecidos',
    cell: ({ row }) => {
      const totalRolos = row.original.tecidoId ? 1 : 0;
      return <span>{totalRolos} {totalRolos === 1 ? 'rolo' : 'rolos'}</span>;
    },
  },
  {
    id: 'produtos',
    header: 'Produtos',
    cell: ({ row }) => {
      const totalPecas = row.original.items?.reduce((acc, item) => acc + (item.quantidadePlanejada || 0), 0) || 0;
      return <span>{totalPecas} peças</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusMap: Record<string, string> = {
        planejado: 'Planejado',
        criado: 'Criado',
        cortado: 'Cortado',
        em_producao: 'Em Produção',
        concluido: 'Concluído',
        cancelado: 'Cancelado',
      };
      
      return (
        <span className="capitalize">
          {statusMap[row.original.status] || row.original.status}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];