import { Button } from "@/components/ui/button";
import { ApiLoteProducaoResponse, LoteProducao } from "@/hooks/queries/useProducao";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";


export const getLoteProducaoColumns = (
  onView: (item: ApiLoteProducaoResponse) => void,
): ColumnDef<ApiLoteProducaoResponse>[] => [
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
      const totalRolos = row.original.materiais?.flatMap(m => m.cores?.flatMap(c => c.rolos || []) || [])?.length || 0;
      return <span>{totalRolos} {totalRolos === 1 ? 'rolo' : 'rolos'}</span>;
    },
  },
  {
    id: 'produtos',
    header: 'Produtos',
    cell: ({ row }) => {
      // Calcular total de peças por cor: (qtdFolhas * quantidadePlanejada) para cada item
      const totalPecas = row.original.materiais?.reduce((materialAcc, material) => {
        return materialAcc + (material.cores?.reduce((corAcc, cor) => {
          const qtdFolhas = cor.qtdFolhas || 0;
          // Para cada cor: somar (qtdFolhas * quantidadePlanejada) de todos os itens de gradeLote
          const pecasPorCor = cor.gradeLote?.reduce((itemAcc, item) => {
            return itemAcc + (qtdFolhas * (item.quantidadePlanejada || 0));
          }, 0) || 0;
          return corAcc + pecasPorCor;
        }, 0) || 0);
      }, 0) || 0;
      
      return <span>{totalPecas}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusMap: Record<string, string> = {
        planejado: 'Planejado',
        esgotado: 'Esgotado',
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