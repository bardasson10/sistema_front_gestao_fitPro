import { EstoqueTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/table-core";
import { StockResume } from "@/types/StockComponents/stock-components";




export const getGroupedStockColumns = (
  rolos: EstoqueTecido[],
  tecidos: { id: string; codigoReferencia: string; corId: string }[],
  cores: { id: string; nome: string; codigoHex: string }[]
): StockResume[] => {
  const safeRolos = Array.isArray(rolos) ? rolos : [];
  const rolosAgrupados = safeRolos.reduce((acc, rolo) => {
    if (rolo.situacao !== 'disponivel') return acc;

    if (!acc[rolo.tecidoId]) {
      acc[rolo.tecidoId] = { rolos: 0, pesoKg: 0 };
    }

    acc[rolo.tecidoId].rolos += 1;
    const pesoAtualKg = typeof rolo.pesoAtualKg === 'number'
      ? rolo.pesoAtualKg
      : Number(rolo.pesoAtualKg || 0);
    acc[rolo.tecidoId].pesoKg += Number.isFinite(pesoAtualKg) ? pesoAtualKg : 0;

    return acc;
  }, {} as Record<string, { rolos: number; pesoKg: number }>);


  return tecidos
    .map(tecido => {
      const infoAgrupada = rolosAgrupados[tecido.id];

      return {
        id: tecido.id,
        codigoReferencia: tecido.codigoReferencia,
        cor: cores.find(c => c.id === tecido.corId)?.codigoHex || '',
        nomeCor: cores.find(c => c.id === tecido.corId)?.nome || '',
        rolos: infoAgrupada?.rolos || 0,
        pesoKg: infoAgrupada?.pesoKg || 0,
      };
    })
    .filter(e => e.rolos > 0);
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

];
