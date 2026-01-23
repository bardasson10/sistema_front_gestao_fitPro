import { Button } from "@/components/ui/button";
import { LoteProducao } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";


export const getLoteProducaoColumns = (
  onView: (item: LoteProducao) => void,
): ColumnDef<LoteProducao>[] => [
  {
    accessorKey: 'codigo',
    header: 'Código',
    cell: ({ row }) => <span className="font-bold">{row.original.codigo}</span>,
  },
  {
    accessorKey: 'dataCreacao',
    header: 'Data',
    cell: ({ row }) => {
      const data = row.original.dataCreacao;
      return <span>{data.toLocaleDateString('pt-BR')}</span>;
    },
  },
  {
    id: 'tecidos',
    header: 'Tecidos',
    cell: ({ row }) => {
      const totalRolos = row.original.tecidosUtilizados.length;
      return <span>{totalRolos} {totalRolos === 1 ? 'rolo' : 'rolos'}</span>;
    },
  },
  {
    id: 'produtos',
    header: 'Produtos',
    cell: ({ row }) => {
      const totalPecas = row.original.grade.reduce((acc, item) => acc + item.total, 0);
      return <span>{totalPecas} peças</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusMap: Record<string, string> = {
        criado: 'Criado',
        cortado: 'Cortado',
        em_producao: 'Em Produção',
        finalizado: 'Finalizado',
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