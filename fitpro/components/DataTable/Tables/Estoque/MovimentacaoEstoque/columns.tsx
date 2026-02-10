import { MovimentacaoEstoque, EstoqueTecido } from "@/types/production";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, CornerDownLeft } from "lucide-react";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { parseNumber } from "@/utils/Formatter/parse-number-format";

export const tipoMovimentacaoMap = {
    entrada: { label: 'Entrada', icon: ArrowDownCircle, iconClassName: 'text-emerald-600', variant: 'success' as const },
    saida: { label: 'Saída', icon: ArrowUpCircle, iconClassName: 'text-red-600', variant: 'danger' as const },
    ajuste: { label: 'Ajuste', icon: RefreshCw, iconClassName: 'text-amber-600', variant: 'warning' as const },
    devolucao: { label: 'Devolução', icon: CornerDownLeft, iconClassName: 'text-sky-600', variant: 'info' as const },
};

export const getStockMovementColumns = (
    rolos: EstoqueTecido[],
    tecidos: { id: string; nome: string; codigoReferencia: string; corId: string }[],
    cores: { id: string; nome: string; codigoHex: string }[],
): ColumnDef<MovimentacaoEstoque>[] => [

        {
            accessorKey: 'usuario',
            header: 'Usuário',
            cell: ({ row }) => {

                return (
                    <div className="flex flex-col">
                        <span className="text-sm">{row.original.usuario?.nome || '-'}</span>
                        {row.original.usuario?.funcaoSetor && (
                            <span className="text-xs text-muted-foreground">{row.original.usuario.funcaoSetor}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'estoqueRoloId',
            header: 'Rolo / Tecido',
            cell: ({ row }) => {
                const rolo = rolos.find(r => r.id === row.original.estoqueRoloId);
                const tecido = rolo ? tecidos.find(t => t.id === rolo.tecidoId) : undefined;
                const cor = tecido ? cores.find(c => c.id === tecido.corId) : undefined;

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                            {rolo?.codigoBarraRolo || '-'}
                        </span>
                        {tecido && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {cor && (
                                    <div
                                        className="h-4 w-4 rounded-full border dark:border-gray-700"
                                        style={{ backgroundColor: cor.codigoHex }}
                                        title={cor.nome}
                                    />
                                )}
                                <span>{tecido.nome} ({tecido.codigoReferencia})</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'tipoMovimentacao',
            header: 'Tipo',
            cell: ({ row }) => {
                const tipo = row.original.tipoMovimentacao;
                const info = tipoMovimentacaoMap[tipo] || tipoMovimentacaoMap.entrada;
                const Icon = info.icon;

                return (
                    <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${info.iconClassName}`} />
                        <StatusBadge status={info.variant}>{info.label}</StatusBadge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'pesoMovimentado',
            header: 'Peso (Kg)',
            cell: ({ row }) => {
                return (
                    <span className="font-medium">
                        {parseNumber(row.original.pesoMovimentado)} Kg
                    </span>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Data',
            cell: ({ row }) => {
                return (
                    <span className="text-muted-foreground">
                        {dataFormatter(row.original.createdAt)}
                    </span>
                );
            },
        },

    ];
