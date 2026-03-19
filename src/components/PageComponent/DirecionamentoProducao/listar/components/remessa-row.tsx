import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronRight, Eye } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { StatusBadge } from "./listar-statusBadge"
import { ServiceFaccao } from "@/types/Faccao"

const tipoServicoLabels: Record<string, ServiceFaccao> = {
    costura: "Costura",
    corte: "Corte",
}

type RemessaItemCompat = DirecionamentoRemessa["items"][number] & {
    estoqueCorte?: {
        produto?: { nome?: string; sku?: string }
        tamanho?: { nome?: string }
        cor?: { nome?: string; codigoHex?: string }
        lote?: { codigoLote?: string }
    }
}


export const RemessaRow = ({ remessa }: { remessa: DirecionamentoRemessa }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = () => setIsOpen((prev) => !prev)

    const getNomeProduto = (item: RemessaItemCompat) =>
        item.produto?.nome ?? item.estoqueCorte?.produto?.nome ?? "-"

    const getSkuProduto = (item: RemessaItemCompat) =>
        item.produto?.sku ?? item.estoqueCorte?.produto?.sku ?? "-"

    const getTamanhoProduto = (item: RemessaItemCompat) =>
        item.produto?.tamanho ?? item.estoqueCorte?.tamanho?.nome ?? "-"

    const getCorNomeProduto = (item: RemessaItemCompat) =>
        item.produto?.cor?.nome ?? item.estoqueCorte?.cor?.nome ?? "-"

    const getCorHexProduto = (item: RemessaItemCompat) =>
        item.produto?.cor?.codigoHex ?? item.estoqueCorte?.cor?.codigoHex ?? "#D4D4D8"

    const getCodigoLote = (item: RemessaItemCompat) =>
        item.lote?.codigoLote ?? item.estoqueCorte?.lote?.codigoLote ?? "-"

    return (
        <>
            <TableRow
                className={cn("cursor-pointer", isOpen && "bg-muted/30")}
                onClick={handleToggle}
            >
                <TableCell>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleToggle()
                        }}
                    >
                        {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="max-w-[160px] truncate text-sm font-medium sm:max-w-none sm:text-base">{remessa.faccao.nome}</span>
                        <span className="max-w-[160px] truncate text-xs text-muted-foreground sm:max-w-none">
                            {remessa.faccao.responsavel}
                        </span>
                        <div className="mt-1 flex items-center gap-2 sm:hidden">
                            <StatusBadge status={remessa.status} />
                            <Badge variant="secondary" className="capitalize">
                                {tipoServicoLabels[remessa.tipoServico] || remessa.tipoServico}
                            </Badge>
                        </div>
                        <span className="mt-1 text-[11px] text-muted-foreground sm:hidden">
                            Saida: {format(new Date(remessa.dataSaida), "dd/MM", { locale: ptBR })} | Retorno: {format(new Date(remessa.dataPrevisaoRetorno), "dd/MM", { locale: ptBR })}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="capitalize">
                        {tipoServicoLabels[remessa.tipoServico] || remessa.tipoServico}
                    </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={remessa.status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                    {remessa.quantidade}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-sm">
                        <span>{format(new Date(remessa.dataSaida), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(remessa.dataSaida), "HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-sm">
                        <span>{format(new Date(remessa.dataPrevisaoRetorno), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(remessa.dataPrevisaoRetorno), "HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>
            {isOpen && (
                <TableRow className="bg-muted/20 hover:bg-muted/30">
                    <TableCell colSpan={8} className="p-0">
                        <div className="p-4">
                            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                                Itens da Remessa ({remessa.items.length})
                            </h4>
                            <div className="space-y-2 md:hidden">
                                {remessa.items.map((item) => (
                                    <div key={item.id} className="rounded-md border bg-card p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{getNomeProduto(item as RemessaItemCompat)}</p>
                                                <p className="truncate text-xs text-muted-foreground">{getSkuProduto(item as RemessaItemCompat)}</p>
                                            </div>
                                            <span className="text-sm font-semibold">{item.quantidade}</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary">{getTamanhoProduto(item as RemessaItemCompat)}</Badge>
                                            <span className="inline-flex items-center gap-1">
                                                <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: getCorHexProduto(item as RemessaItemCompat) }} />
                                                {getCorNomeProduto(item as RemessaItemCompat)}
                                            </span>
                                            <span>Lote: {getCodigoLote(item as RemessaItemCompat)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden rounded-md border bg-card md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Tamanho</TableHead>
                                            <TableHead>Cor</TableHead>
                                            <TableHead>Lote</TableHead>
                                            <TableHead className="text-right">Quantidade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {remessa.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{getNomeProduto(item as RemessaItemCompat)}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {getSkuProduto(item as RemessaItemCompat)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{getTamanhoProduto(item as RemessaItemCompat)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-4 w-4 rounded-full border"
                                                            style={{ backgroundColor: getCorHexProduto(item as RemessaItemCompat) }}
                                                        />
                                                        <span>{getCorNomeProduto(item as RemessaItemCompat)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCodigoLote(item as RemessaItemCompat)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {item.quantidade}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
