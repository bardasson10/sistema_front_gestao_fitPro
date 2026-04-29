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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { ptBR } from "date-fns/locale"
import { ChevronDown, ChevronRight, Eye } from "lucide-react"
import { format } from "date-fns"
import { useMemo, useState } from "react"
import { StatusBadge } from "./listar-statusBadge"
import { ServiceFaccao } from "@/types/Faccao"
import { formatNumberToBRL } from "@/utils/Formatter/moeda-brasil-format"
import {
    usePutDirecionamento,
    usePutDirecionamentoSkuPrice,
    usePutDirecionamentoStatus,
} from "@/hooks/queries/Direcionamento/useDirecionamento"
import { DirecionamentoStatus } from "@/types/Direcionamento"
import { EditarItensRemessaModal } from "./editar-itens-remessa-modal"

const tipoServicoLabels: Record<string, ServiceFaccao> = {
    costura: "Costura",
    corte: "Corte",
}

type RemessaItemCompat = DirecionamentoRemessa["items"][number] & {
    estoqueCorteId?: string
    valorFaccaoPorPeca?: number
    estoqueCorte?: {
        id?: string
        produto?: { nome?: string; sku?: string; valorFaccaoPorPeca?: number }
        tamanho?: { nome?: string }
        cor?: { nome?: string; codigoHex?: string }
        lote?: { codigoLote?: string }
    }
    produto?: {
        nome?: string
        sku?: string
        valorFaccaoPorPeca?: number
        tamanho?: string
        cor?: { nome?: string; codigoHex?: string }
    }
}


export const RemessaRow = ({ remessa }: { remessa: DirecionamentoRemessa }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [tipoServicoEdit, setTipoServicoEdit] = useState<string>(remessa.tipoServico)
    const [statusEdit, setStatusEdit] = useState<string>(remessa.status)
    const [quantidadesEdit, setQuantidadesEdit] = useState<Record<string, number>>({})
    const [skuPricesEdit, setSkuPricesEdit] = useState<Record<string, number>>({})

    const putDirecionamento = usePutDirecionamento()
    const putDirecionamentoStatus = usePutDirecionamentoStatus()
    const putDirecionamentoSkuPrice = usePutDirecionamentoSkuPrice()

    const canEditAll = remessa.status === DirecionamentoStatus.SEPARADO
    const canEditSkuPrice = remessa.status === DirecionamentoStatus.EM_PRODUCAO
    const isLocked = remessa.status === DirecionamentoStatus.ENTREGUE

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

    const getValorFaccaoPorPeca = (item: RemessaItemCompat) =>
        Number(
            item.valorFaccaoPorPeca ??
            item.produto?.valorFaccaoPorPeca ??
            item.estoqueCorte?.produto?.valorFaccaoPorPeca ??
            0
        )

    const parseDate = (value?: string | null) => {
        if (!value) return null
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    const dataSaida = parseDate(remessa.dataSaida)
    const dataPrevisaoRetorno = parseDate(remessa.dataPrevisaoRetorno)

    const getInitialValorFaccaoPorSku = (sku: string) => {
        const matchedItem = remessa.items.find(
            (item) => getSkuProduto(item as RemessaItemCompat) === sku
        ) as RemessaItemCompat | undefined

        return Number(
            matchedItem?.valorFaccaoPorPeca ??
            matchedItem?.produto?.valorFaccaoPorPeca ??
            matchedItem?.estoqueCorte?.produto?.valorFaccaoPorPeca ??
            0
        )
    }

    const skuPriceList = useMemo(
        () =>
            Array.from(new Set(remessa.items.map((item) => getSkuProduto(item as RemessaItemCompat))))
                .filter((sku) => sku && sku !== "-")
                .map((sku) => ({
                    sku,
                    valorFaccaoPorPeca:
                        skuPricesEdit[sku] !== undefined
                            ? skuPricesEdit[sku]
                            : getInitialValorFaccaoPorSku(sku),
                })),
        [remessa.items, skuPricesEdit]
    )

    const itensComQtdEdit = useMemo(
        () =>
            remessa.items.map((item) => ({
                ...item,
                quantidadeEditada:
                    quantidadesEdit[item.id] !== undefined
                        ? quantidadesEdit[item.id]
                        : Number(item.quantidade || 0),
            })),
        [quantidadesEdit, remessa.items],
    )

    const handleSalvarDirecionamento = () => {
        const items = itensComQtdEdit
            .map((item) => {
                const itemCompat = item as RemessaItemCompat
                const estoqueCorteId = itemCompat.estoqueCorteId || itemCompat.estoqueCorte?.id

                if (!estoqueCorteId) return null

                return {
                    estoqueCorteId,
                    quantidade: Number(item.quantidadeEditada || 0),
                }
            })
            .filter((item): item is { estoqueCorteId: string; quantidade: number } => item !== null)

        putDirecionamento.mutate({
            id: remessa.id,
            dados: {
                direcionamentos: [
                    {
                        faccaoId: remessa.faccao.id,
                        tipoServico: tipoServicoEdit,
                        items,
                    },
                ],
            },
        })
    }

    const handleSalvarSkuPrice = () => {
        const skuMap = new Map<string, number>()

        remessa.items.forEach((item) => {
            const sku = getSkuProduto(item as RemessaItemCompat)
            const value = skuPricesEdit[sku]

            if (!sku || sku === "-" || value === undefined || Number(value) <= 0) {
                return
            }

            skuMap.set(sku, Number(value))
        })

        const produtoSKU = Array.from(skuMap.entries()).map(([sku, valorFaccaoPorPeca]) => ({
            sku,
            valorFaccaoPorPeca,
        }))

        if (!produtoSKU.length) return

        putDirecionamentoSkuPrice.mutate({
            id: remessa.id,
            dados: { produtoSKU },
        })
    }

    const handleSalvarStatus = () => {
        putDirecionamentoStatus.mutate({
            id: remessa.id,
            dados: { status: statusEdit },
        })
    }

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
                        <span className="max-w-40 truncate text-sm font-medium sm:max-w-none sm:text-base">{remessa.faccao.nome}</span>
                        <span className="max-w-40 truncate text-xs text-muted-foreground sm:max-w-none">
                            {remessa.faccao.responsavel}
                        </span>
                        <div className="mt-1 flex items-center gap-2 sm:hidden">
                            <StatusBadge status={remessa.status} />
                            <Badge variant="secondary" className="capitalize">
                                {tipoServicoLabels[remessa.tipoServico] || remessa.tipoServico}
                            </Badge>
                        </div>
                        <span className="mt-1 text-[11px] font-medium text-muted-foreground sm:hidden">
                            Total estimado: {formatNumberToBRL(Number(remessa.valorTotalEstimado || 0))}
                        </span>
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
                    <div className="flex flex-col gap-1">
                        <StatusBadge status={remessa.status} />
                        <span className="text-xs font-medium text-muted-foreground">
                            Total estimado: {formatNumberToBRL(Number(remessa.valorTotalEstimado || 0))}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                    {remessa.quantidade}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-sm">
                        {dataSaida ? (
                            <>
                                <span>{format(dataSaida, "dd/MM/yyyy", { locale: ptBR })}</span>
                                <span className="text-xs text-muted-foreground">
                                    {format(dataSaida, "HH:mm", { locale: ptBR })}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">Aguardando ficar em produção</span>
                        )}
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-sm">
                        {dataPrevisaoRetorno ? (
                            <>
                                <span>{format(dataPrevisaoRetorno, "dd/MM/yyyy", { locale: ptBR })}</span>
                                <span className="text-xs text-muted-foreground">
                                    {format(dataPrevisaoRetorno, "HH:mm", { locale: ptBR })}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">Aguardando data saída</span>
                        )}
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
                            <div className="mb-4 grid gap-3 rounded-md border bg-card p-3 md:grid-cols-3">
                                <div className="space-y-1">
                                    <Label>Tipo de Serviço</Label>
                                    <Select
                                        value={tipoServicoEdit}
                                        onValueChange={setTipoServicoEdit}
                                        disabled={!canEditAll}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="costura">Costura</SelectItem>
                                            <SelectItem value="corte">Corte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label>Status</Label>
                                    <Select value={statusEdit} onValueChange={setStatusEdit}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={DirecionamentoStatus.SEPARADO}>Separado</SelectItem>
                                            <SelectItem value={DirecionamentoStatus.EM_PRODUCAO}>Em Produção</SelectItem>
                                            <SelectItem value={DirecionamentoStatus.ENTREGUE}>Entregue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleSalvarDirecionamento}
                                        disabled={!canEditAll || putDirecionamento.isPending}
                                    >
                                        Salvar Remessa
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSalvarStatus}
                                        disabled={putDirecionamentoStatus.isPending || statusEdit === remessa.status}
                                    >
                                        Atualizar Status
                                    </Button>
                                </div>
                            </div>

                            <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                                Itens da Remessa ({remessa.items.length})
                            </h4>

                            <div className="mb-4 rounded-md border bg-muted/20 p-3">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium">Valores por SKU</p>
                                        <p className="text-xs text-muted-foreground">
                                            Edite o valor da facção por peça para cada SKU da remessa.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {skuPriceList.map((skuItem) => (
                                        <div key={skuItem.sku} className="rounded-md border bg-card p-3">
                                            <div className="mb-2 flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{skuItem.sku}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatNumberToBRL(Number(skuItem.valorFaccaoPorPeca || 0))}
                                                    </p>
                                                </div>
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                className="text-right"
                                                placeholder="0,00"
                                                value={skuPricesEdit[skuItem.sku] ?? skuItem.valorFaccaoPorPeca ?? ""}
                                                onChange={(e) =>
                                                    setSkuPricesEdit((prev) => ({
                                                        ...prev,
                                                        [skuItem.sku]: Number(e.target.value || 0),
                                                    }))
                                                }
                                                disabled={!canEditSkuPrice || isLocked}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

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
                                            <span>Preço: {formatNumberToBRL(getValorFaccaoPorPeca(item as RemessaItemCompat))}</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                value={
                                                    quantidadesEdit[item.id] !== undefined
                                                        ? quantidadesEdit[item.id]
                                                        : Number(item.quantidade || 0)
                                                }
                                                onChange={(e) =>
                                                    setQuantidadesEdit((prev) => ({
                                                        ...prev,
                                                        [item.id]: Number(e.target.value || 0),
                                                    }))
                                                }
                                                disabled={!canEditAll || isLocked}
                                            />
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
                                            <TableHead className="text-right">Preço SKU</TableHead>
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
                                                    {formatNumberToBRL(getValorFaccaoPorPeca(item as RemessaItemCompat))}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        className="ml-auto w-24 text-right"
                                                        value={
                                                            quantidadesEdit[item.id] !== undefined
                                                                ? quantidadesEdit[item.id]
                                                                : Number(item.quantidade || 0)
                                                        }
                                                        onChange={(e) =>
                                                            setQuantidadesEdit((prev) => ({
                                                                ...prev,
                                                                [item.id]: Number(e.target.value || 0),
                                                            }))
                                                        }
                                                        disabled={!canEditAll || isLocked}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-3 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSalvarSkuPrice}
                                    disabled={!canEditSkuPrice || putDirecionamentoSkuPrice.isPending || isLocked}
                                >
                                    Salvar Preço por SKU
                                </Button>
                                <EditarItensRemessaModal
                                    remessa={remessa}
                                    disabled={!canEditAll || isLocked}
                                />
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
