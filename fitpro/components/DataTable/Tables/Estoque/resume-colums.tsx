import { EstoqueTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/table-core";
import { StockResume } from "@/types/StockComponents/stock-components";




export const getGroupedStockColumns = (
  rolos: EstoqueTecido[],
  tecidos: { id: string; tipo: string; corId: string }[],
  cores: { id: string; nome: string; codigoHex: string }[]
): StockResume[] => {
  const safeRolos = Array.isArray(rolos) ? rolos : [];
  const rolosAgrupados = safeRolos.reduce((acc, rolo) => {
    if (rolo.status !== 'disponivel') return acc;

    if (!acc[rolo.tecidoId]) {
      acc[rolo.tecidoId] = { rolos: 0, pesoKg: 0 };
    }

    acc[rolo.tecidoId].rolos += 1;
    acc[rolo.tecidoId].pesoKg += rolo.pesoAtualKg;

    return acc;
  }, {} as Record<string, { rolos: number; pesoKg: number }>);


  return tecidos
    .map(tecido => {
      const infoAgrupada = rolosAgrupados[tecido.id];

      return {
        id: tecido.id,
        tipo: tecido.tipo,
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
    accessorKey: 'tipo',
    header: 'Tecido',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.tipo}</span>,
  },
  {
    accessorKey: 'cor',
    header: 'Cor',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: row.original.cor }}
          />
          <span>{row.original.cor}</span>
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
