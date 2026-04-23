import { EstoqueTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/table-core";
import { StockResume } from "@/types/StockComponents/stock-components";

import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format";
import { EstoqueRolo } from "@/types/EstoqueRolo";




export const getGroupedStockColumns = (
  rolos: EstoqueRolo[],
  tecidos: { id: string; codigoReferencia: string; corId: string, valorPorKg: number }[],
  cores: { id: string; nome: string; codigoHex: string }[]
): StockResume[] => {
  const safeRolos = Array.isArray(rolos) ? rolos : [];
  const tecidosMap = new Map(tecidos.map((tecido) => [tecido.id, tecido]));

  const grouped = safeRolos.reduce((acc, rolo) => {
    if (rolo.situacao !== 'disponivel') return acc;

    const tecidoId = rolo.tecidoId || rolo.tecido?.id;
    if (!tecidoId) return acc;

    const tecidoFallback = tecidosMap.get(tecidoId);
    const tecidoRolo = rolo.tecido;
    const corId = tecidoRolo?.corId || tecidoFallback?.corId || '';
    const corInfo = cores.find((cor) => cor.id === corId);
    const valorPorKg = Number(tecidoRolo?.valorPorKg ?? tecidoFallback?.valorPorKg ?? 0);

    if (!acc[tecidoId]) {
      acc[tecidoId] = {
        id: tecidoId,
        codigoReferencia: tecidoRolo?.codigoReferencia || tecidoFallback?.codigoReferencia || '-',
        cor: corInfo?.codigoHex || '',
        nomeCor: corInfo?.nome || '',
        rolos: 0,
        pesoKg: 0,
        valorTotal: 0,
      };
    }

    const pesoAtualKg = typeof rolo.pesoAtualKg === 'number'
      ? rolo.pesoAtualKg
      : Number(rolo.pesoAtualKg || 0);
    const pesoSeguro = Number.isFinite(pesoAtualKg) ? pesoAtualKg : 0;

    acc[tecidoId].rolos += 1;
    acc[tecidoId].pesoKg += pesoSeguro;
    acc[tecidoId].valorTotal = acc[tecidoId].pesoKg * (Number.isFinite(valorPorKg) ? valorPorKg : 0);

    return acc;
  }, {} as Record<string, StockResume>);

  return Object.values(grouped).filter((item) => item.rolos > 0);
};

export const getStockColumnsResume = (): ColumnDef<StockResume>[] => [

  {
    accessorKey: 'codigoReferencia',
    header: 'Tecido',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.codigoReferencia}</span>,
  },
  {
    accessorKey: 'cor',
    header: 'Cor',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 ">
          <div
            className="h-4 w-4 rounded-full border dark:border-gray-700 "
            style={{ backgroundColor: row.original.cor }}
          />
          <span>{row.original.nomeCor}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'rolos',
    header: 'Qtd. Rolos',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.rolos}</span>,
  },
  {
    accessorKey: 'pesoKg',
    header: 'Peso Total (Kg)',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.pesoKg.toFixed(1)}</span>,
  },
  {
    accessorKey: 'valorTotal',
    header: 'Valor Total',
    cell: ({ row }) => <span className="text-muted-foreground">{formatNumberToBRL(row.original.valorTotal)}</span>,
  },

];
