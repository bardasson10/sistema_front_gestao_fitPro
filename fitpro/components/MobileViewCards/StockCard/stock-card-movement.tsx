import { tipoMovimentacaoMap } from "@/components/DataTable/Tables/Estoque/MovimentacaoEstoque/columns"
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { BaseCard } from "@/components/MobileViewCards/base-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { MovimentacaoEstoque } from "@/types/production"
import { StockMovimentacao } from "@/types/StockComponents/stock-components"
import { dataFormatter } from "@/utils/Formatter/data-brasil-format"
import { parseNumber } from "@/utils/Formatter/parse-number-format"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, CornerDownLeft } from "lucide-react"
import React from "react"





export const MobileViewStockMovement = ({
    movimentacoes,
    rolos,
    tecidos,
    cores,
    isLoading,
}: StockMovimentacao) => {

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <SemDadosComponent<MovimentacaoEstoque> nomeDado="movimentação" data={movimentacoes} />
            {Array.isArray(movimentacoes) && movimentacoes.map((item) => (
                (() => {
                    const rolo = rolos.find(r => r.id === item.estoqueRoloId);
                    const tecido = rolo ? tecidos.find(t => t.id === rolo.tecidoId) : undefined;
                    const cor = tecido ? cores.find(c => c.id === tecido.corId) : undefined;
                    const info = tipoMovimentacaoMap[item.tipoMovimentacao] || tipoMovimentacaoMap.entrada;
                    const Icon = info.icon;

                    return (
                <BaseCard
                    key={item.id}
                    title={
                        <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${info.iconClassName}`} />
                            <StatusBadge status={info.variant}>{info.label}</StatusBadge>
                        </div>
                    }
                    cardClassName="min-h-fit"
                    headerClassName="pb-2"
                    content={
                        <div className="grid gap-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data:</span>
                                <span className="font-medium">{dataFormatter(item.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Rolo / Tecido:</span>
                                <div className="flex items-center gap-2">
                                    {cor && (
                                        <div
                                            className="h-4 w-4 rounded-full border dark:border-gray-700"
                                            style={{ backgroundColor: cor.codigoHex }}
                                            title={cor.nome}
                                        />
                                    )}
                                    <span className="font-medium">
                                        {rolo?.codigoBarraRolo || '-'}
                                    </span>
                                </div>
                            </div>
                            {tecido && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tecido:</span>
                                    <span className="font-medium">
                                        {tecido.nome} ({tecido.codigoReferencia})
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Peso:</span>
                                <span className="font-medium">{parseNumber(item.pesoMovimentado)} Kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Usuário:</span>
                                <span className="font-medium">{item.usuario?.nome || '-'}</span>
                            </div>
                            {item.usuario?.funcaoSetor && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Setor:</span>
                                    <span className="font-medium">{item.usuario.funcaoSetor}</span>
                                </div>
                            )}
                        </div>
                    }
                //     footer={
                //       <div className="flex w-full gap-2">
                //         <Button
                //           variant="outline"
                //           className="flex-1"
                //           onClick={() => onEdit(item)}
                //         >
                //           <Pencil className="mr-2 h-4 w-4" />
                //           Editar
                //         </Button>
                //         {/* <Button
                //            variant="destructive"
                //            size="icon"
                //            onClick={() => onRemove(item.id)}
                //          >
                //            <Trash2 className="h-4 w-4" />
                //          </Button> */}
                //       </div>
                //     }
                //     footerClassName="border-t 0 bg-muted/50 px-6 py-8"
                />
                    );
                })()
            ))}

        </div>
    )
}