import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, CornerDownLeft } from "lucide-react";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { IMovimentacaoRolo } from "@/types/EstoqueRolo";

export const tipoMovimentacaoMap = {
    entrada: { label: 'Entrada', icon: ArrowDownCircle, iconClassName: 'text-emerald-600', variant: 'success' as const },
    saida: { label: 'Saída', icon: ArrowUpCircle, iconClassName: 'text-red-600', variant: 'danger' as const },
    ajuste: { label: 'Ajuste', icon: RefreshCw, iconClassName: 'text-amber-600', variant: 'warning' as const },
    devolucao: { label: 'Devolução', icon: CornerDownLeft, iconClassName: 'text-sky-600', variant: 'info' as const },
};

export const getStockMovementColumns = (
    rolos: { id: string; tecidoId: string; codigoBarraRolo: string }[],
    tecidos: { id: string; nome: string; codigoReferencia: string; corId: string }[],
    cores: { id: string; nome: string; codigoHex: string }[],
): ColumnDef<IMovimentacaoRolo>[] => [

        {
            accessorKey: 'responsavel',
            header: 'Usuário',
            cell: ({ row }) => {
                const responsavel = row.original.responsavel;

                return (
                    <span className="text-sm">{responsavel?.nome || '-'}</span>
                );
            },
        },
        {
            accessorKey: 'rolo',
            header: 'Rolo / Tecido',
            cell: ({ row }) => {
                const roloFallback = row.original.estoqueRoloId
                    ? rolos.find((r) => r.id === row.original.estoqueRoloId)
                    : undefined;

                const rolo = row.original.rolo ?? roloFallback;

                const tecidoRaw = row.original.rolo?.fornecedor?.tecido
                    ?? (roloFallback ? tecidos.find((t) => t.id === roloFallback.tecidoId) : undefined);

                const cor = tecidoRaw
                    ? ("cor" in tecidoRaw
                        ? tecidoRaw.cor
                        : cores.find((c) => c.id === tecidoRaw.corId))
                    : undefined;

                const tecidoNome = tecidoRaw?.nome;
                const tecidoCodigoReferencia = tecidoRaw?.codigoReferencia;

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">
                            {rolo?.codigoBarraRolo || '-'}
                        </span>
                        {tecidoRaw && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {cor && (
                                    <div
                                        className="h-4 w-4 rounded-full border dark:border-gray-700"
                                        style={{ backgroundColor: cor.codigoHex }}
                                        title={cor.nome}
                                    />
                                )}
                                <span>{tecidoNome} ({tecidoCodigoReferencia})</span>
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
                const info = tipo in tipoMovimentacaoMap
                    ? tipoMovimentacaoMap[tipo as keyof typeof tipoMovimentacaoMap]
                    : tipoMovimentacaoMap.entrada;
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
                        {row.original.createdAt ? dataFormatter(row.original.createdAt) : '-'}
                    </span>
                );
            },
        },

    ];
