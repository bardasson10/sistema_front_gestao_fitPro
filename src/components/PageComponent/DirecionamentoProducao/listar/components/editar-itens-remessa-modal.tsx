"use client"

import { useMemo, useState } from "react"
import { Package, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { EstoqueCorte } from "@/types/EstoqueCorte"
import {
    useGetEstoqueCorteLista,
    usePutDirecionamentoItens,
} from "@/hooks/queries/Direcionamento/useDirecionamento"
import { DirecionamentoPutItensRequestBodyPayload } from "@/types/Direcionamento"

type ItemOriginalMap = Record<string, number>
type QuantidadeMap = Record<string, string>

interface EditarItensRemessaModalProps {
    remessa: DirecionamentoRemessa
    disabled?: boolean
}

const getEstoqueCorteId = (item: DirecionamentoRemessa["items"][number]) => {
    const nestedEstoque = (item as any)?.estoqueCorte?.id
    return item.estoqueCorteId ?? nestedEstoque ?? null
}

export function EditarItensRemessaModal({ remessa, disabled }: EditarItensRemessaModalProps) {
    const [open, setOpen] = useState(false)
    const [busca, setBusca] = useState("")
    const [skuFiltro, setSkuFiltro] = useState("todos")
    const [corFiltro, setCorFiltro] = useState("todos")
    const [tamanhoFiltro, setTamanhoFiltro] = useState("todos")
    const [quantidadesEditadas, setQuantidadesEditadas] = useState<QuantidadeMap>({})

    const { data: estoquesData, isFetching } = useGetEstoqueCorteLista({ limit: 10000 }, {
        enabled: open,
    })
    const putDirecionamentoItens = usePutDirecionamentoItens()

    const estoques = useMemo(() => estoquesData ?? [], [estoquesData])
    const estoqueById = useMemo(() => {
        return estoques.reduce<Record<string, EstoqueCorte>>((acc, estoque) => {
            acc[estoque.id] = estoque
            return acc
        }, {})
    }, [estoques])

    const quantidadesOriginais = useMemo<ItemOriginalMap>(() => {
        return remessa.items.reduce<ItemOriginalMap>((acc, item) => {
            const key = getEstoqueCorteId(item)
            if (!key) return acc

            acc[key] = Number(item.quantidade ?? 0)
            return acc
        }, {})
    }, [remessa.items])

    const normalizarQuantidade = (valor: string, min: number, max: number) => {
        const quantidadeNumerica = Number(valor || 0)
        const quantidadeTratada = Number.isNaN(quantidadeNumerica) ? 0 : quantidadeNumerica
        return Math.max(min, Math.min(quantidadeTratada, max))
    }

    const normalizarTexto = (valor?: string | null) => (valor ?? "").trim().toLowerCase()

    const filtraPorCampos = (campos: { sku?: string | null; cor?: string | null; tamanho?: string | null }) => {
        const matchSku = skuFiltro === "todos" || normalizarTexto(campos.sku) === normalizarTexto(skuFiltro)
        const matchCor = corFiltro === "todos" || normalizarTexto(campos.cor) === normalizarTexto(corFiltro)
        const matchTamanho =
            tamanhoFiltro === "todos" || normalizarTexto(campos.tamanho) === normalizarTexto(tamanhoFiltro)

        return matchSku && matchCor && matchTamanho
    }

    const buildOptions = (values: string[]) =>
        Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"))

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)

        if (!nextOpen) {
            return
        }

        setBusca("")
        setSkuFiltro("todos")
        setCorFiltro("todos")
        setTamanhoFiltro("todos")
        setQuantidadesEditadas(
            Object.entries(quantidadesOriginais).reduce<QuantidadeMap>((acc, [id, quantidade]) => {
                acc[id] = String(quantidade)
                return acc
            }, {}),
        )
    }

    const remessaItemsFiltrados = useMemo(() => {
        if (!busca) return remessa.items

        const termo = busca.toLowerCase()
        return remessa.items.filter((item) => {
            const nomeProduto = item.produto?.nome ?? ""
            const sku = item.produto?.sku ?? ""
            const tamanho = item.produto?.tamanho ?? ""
            const cor = item.produto?.cor?.nome ?? ""
            const lote = item.lote?.codigoLote ?? ""

            return (
                nomeProduto.toLowerCase().includes(termo) ||
                sku.toLowerCase().includes(termo) ||
                tamanho.toLowerCase().includes(termo) ||
                cor.toLowerCase().includes(termo) ||
                lote.toLowerCase().includes(termo)
            )
        })
    }, [busca, remessa.items])

    const estoquesDisponiveis = useMemo(() => {
        return estoques.filter((estoque) => !quantidadesOriginais[estoque.id])
    }, [estoques, quantidadesOriginais])

    const skuOptions = useMemo(() => {
        const skusRemessa = remessa.items.map((item) => item.produto?.sku ?? "")
        const skusEstoque = estoquesDisponiveis.map((estoque) => estoque.produto.sku)
        return buildOptions([...skusRemessa, ...skusEstoque])
    }, [remessa.items, estoquesDisponiveis])

    const corOptions = useMemo(() => {
        const coresRemessa = remessa.items.map((item) => item.produto?.cor?.nome ?? "")
        const coresEstoque = estoquesDisponiveis.map((estoque) => estoque.cor.nome)
        return buildOptions([...coresRemessa, ...coresEstoque])
    }, [remessa.items, estoquesDisponiveis])

    const tamanhoOptions = useMemo(() => {
        const tamanhosRemessa = remessa.items.map((item) => item.produto?.tamanho ?? "")
        const tamanhosEstoque = estoquesDisponiveis.map((estoque) => estoque.tamanho.nome)
        return buildOptions([...tamanhosRemessa, ...tamanhosEstoque])
    }, [remessa.items, estoquesDisponiveis])

    const remessaItemsFiltradosComCampos = useMemo(() => {
        return remessaItemsFiltrados.filter((item) =>
            filtraPorCampos({
                sku: item.produto?.sku,
                cor: item.produto?.cor?.nome,
                tamanho: item.produto?.tamanho,
            }),
        )
    }, [remessaItemsFiltrados, skuFiltro, corFiltro, tamanhoFiltro])

    const remessaItensAgrupadosPorSku = useMemo(() => {
        return remessaItemsFiltradosComCampos.reduce<Record<string, DirecionamentoRemessa["items"]>>((acc, item) => {
            const sku = item.produto?.sku || "Sem SKU"
            if (!acc[sku]) {
                acc[sku] = []
            }
            acc[sku].push(item)
            return acc
        }, {})
    }, [remessaItemsFiltradosComCampos])

    const skusOrdenados = useMemo(
        () => Object.keys(remessaItensAgrupadosPorSku).sort((a, b) => a.localeCompare(b, "pt-BR")),
        [remessaItensAgrupadosPorSku],
    )

    const estoquesDisponiveisFiltrados = useMemo(() => {
        const estoquesComFiltroDeCampos = estoquesDisponiveis.filter((estoque) =>
            filtraPorCampos({
                sku: estoque.produto.sku,
                cor: estoque.cor.nome,
                tamanho: estoque.tamanho.nome,
            }),
        )

        if (!busca) return estoquesComFiltroDeCampos

        const termo = busca.toLowerCase()
        return estoquesComFiltroDeCampos.filter((estoque) => {
            return (
                estoque.produto.nome.toLowerCase().includes(termo) ||
                estoque.produto.sku.toLowerCase().includes(termo) ||
                estoque.tamanho.nome.toLowerCase().includes(termo) ||
                estoque.cor.nome.toLowerCase().includes(termo) ||
                estoque.lote.codigoLote.toLowerCase().includes(termo)
            )
        })
    }, [busca, corFiltro, estoquesDisponiveis, skuFiltro, tamanhoFiltro])

    const handleQuantidadeRemessaChange = (itemId: string, valor: string) => {
        if (valor !== "" && !/^\d+$/.test(valor)) return

        const quantidadeOriginal = quantidadesOriginais[itemId] ?? 0
        const quantidadeDisponivel = estoqueById[itemId]?.quantidadeDisponivel ?? 0
        const maxQuantidade = quantidadeOriginal + quantidadeDisponivel
        const quantidadeNormalizada = valor === ""
            ? ""
            : String(normalizarQuantidade(valor, 0, maxQuantidade))

        setQuantidadesEditadas((prev) => ({
            ...prev,
            [itemId]: quantidadeNormalizada,
        }))
    }

    const handleQuantidadeDisponivelChange = (estoque: EstoqueCorte, valor: string) => {
        if (valor !== "" && !/^\d+$/.test(valor)) return

        const quantidadeNormalizada = valor === ""
            ? ""
            : String(normalizarQuantidade(valor, 1, estoque.quantidadeDisponivel))

        setQuantidadesEditadas((prev) => ({
            ...prev,
            [estoque.id]: quantidadeNormalizada,
        }))
    }

    const handleAdicionarItem = (estoque: EstoqueCorte) => {
        const quantidadeAtual = quantidadesEditadas[estoque.id] ?? "1"
        const quantidadeNormalizada = normalizarQuantidade(quantidadeAtual, 1, estoque.quantidadeDisponivel)

        setQuantidadesEditadas((prev) => ({
            ...prev,
            [estoque.id]: String(quantidadeNormalizada),
        }))
    }

    const handleRemoverItem = (itemId: string) => {
        setQuantidadesEditadas((prev) => ({
            ...prev,
            [itemId]: "0",
        }))
    }

    const temAlteracoes = useMemo(() => {
        const ids = new Set<string>([
            ...Object.keys(quantidadesOriginais),
            ...Object.keys(quantidadesEditadas),
        ])

        return Array.from(ids).some((id) => {
            const quantidadeOriginal = quantidadesOriginais[id] ?? 0
            const quantidadeDisponivel = estoqueById[id]?.quantidadeDisponivel ?? 0
            const maxQuantidade = quantidadeOriginal + quantidadeDisponivel
            const quantidadeAtual = normalizarQuantidade(
                quantidadesEditadas[id] ?? String(quantidadeOriginal),
                0,
                maxQuantidade,
            )

            return quantidadeAtual !== quantidadeOriginal
        })
    }, [estoqueById, quantidadesEditadas, quantidadesOriginais])

    const handleSalvar = () => {
        const itensAdicionar: { estoqueCorteId: string; quantidade: number }[] = []
        const itensRemover: { estoqueCorteId: string; quantidade: number }[] = []

        const ids = new Set<string>([
            ...Object.keys(quantidadesOriginais),
            ...Object.keys(quantidadesEditadas),
        ])

        Array.from(ids).forEach((id) => {
            const quantidadeOriginal = quantidadesOriginais[id] ?? 0
            const quantidadeDisponivel = estoqueById[id]?.quantidadeDisponivel ?? 0
            const maxQuantidade = quantidadeOriginal + quantidadeDisponivel
            const quantidadeAtual = normalizarQuantidade(
                quantidadesEditadas[id] ?? String(quantidadeOriginal),
                0,
                maxQuantidade,
            )

            if (quantidadeAtual > quantidadeOriginal) {
                itensAdicionar.push({
                    estoqueCorteId: id,
                    quantidade: quantidadeAtual - quantidadeOriginal,
                })
                return
            }

            if (quantidadeAtual < quantidadeOriginal) {
                itensRemover.push({
                    estoqueCorteId: id,
                    quantidade: quantidadeOriginal - quantidadeAtual,
                })
            }
        })

        if (!itensAdicionar.length && !itensRemover.length) {
            return
        }

        const dados: DirecionamentoPutItensRequestBodyPayload = {}
        if (itensAdicionar.length) dados.itensAdicionar = itensAdicionar
        if (itensRemover.length) dados.itensRemover = itensRemover

        putDirecionamentoItens.mutate(
            {
                id: remessa.id,
                dados,
            },
            {
                onSuccess: () => {
                    setOpen(false)
                },
            },
        )
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                <Package className="mr-2 h-4 w-4" />
                Editar itens da remessa
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-[96vw] sm:max-w-6xl lg:max-w-7xl max-h-[92vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Editar itens da remessa
                        </DialogTitle>
                        <DialogDescription>
                            Adicione ou remova quantidades por estoqueCorteId na remessa de {remessa.faccao.nome}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar por produto, SKU, tamanho, cor ou lote..."
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{estoquesDisponiveisFiltrados.length} item(ns) no estoque</Badge>
                                <span>Remessa: {remessa.quantidade} peças</span>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                            <Select value={skuFiltro} onValueChange={setSkuFiltro}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por SKU" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os SKUs</SelectItem>
                                    {skuOptions.map((sku) => (
                                        <SelectItem key={sku} value={sku}>
                                            {sku}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={corFiltro} onValueChange={setCorFiltro}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por cor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todas as cores</SelectItem>
                                    {corOptions.map((cor) => (
                                        <SelectItem key={cor} value={cor}>
                                            {cor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={tamanhoFiltro} onValueChange={setTamanhoFiltro}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por tamanho" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os tamanhos</SelectItem>
                                    {tamanhoOptions.map((tamanho) => (
                                        <SelectItem key={tamanho} value={tamanho}>
                                            {tamanho}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Tabs defaultValue="remessa" className="gap-3">
                        <TabsList className="grid h-auto w-full grid-cols-2">
                            <TabsTrigger value="remessa">Itens na remessa ({remessaItemsFiltradosComCampos.length})</TabsTrigger>
                            <TabsTrigger value="estoque">Estoque disponível ({estoquesDisponiveisFiltrados.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="remessa" className="mt-0">
                            <div className="rounded-md border">
                                <ScrollArea className="h-[60vh]">
                                    {isFetching ? (
                                        <div className="flex min-h-70 items-center justify-center">
                                            <Spinner className="size-8" />
                                        </div>
                                    ) : remessaItemsFiltradosComCampos.length === 0 ? (
                                        <div className="flex min-h-70 items-center justify-center px-6 text-sm text-muted-foreground">
                                            Nenhum item permanece na remessa.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 p-4">
                                            {skusOrdenados.map((sku) => (
                                                <div key={sku} className="rounded-lg border border-primary/30 bg-primary/5">
                                                    <div className="border-b px-4 py-3">
                                                        <Badge variant="secondary" className="font-mono text-xs">
                                                            SKU: {sku}
                                                        </Badge>
                                                    </div>

                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Produto</TableHead>
                                                                <TableHead>Tamanho</TableHead>
                                                                <TableHead>Cor</TableHead>
                                                                <TableHead>Lote</TableHead>
                                                                <TableHead className="text-right">Atual</TableHead>
                                                                <TableHead className="text-right">Qtd. final</TableHead>
                                                                <TableHead className="text-right">Ações</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {remessaItensAgrupadosPorSku[sku].map((itemRemessa) => {
                                                                const itemId = getEstoqueCorteId(itemRemessa)
                                                                if (!itemId) return null

                                                                const quantidadeOriginal = quantidadesOriginais[itemId] ?? 0
                                                                const quantidadeDisponivel = estoqueById[itemId]?.quantidadeDisponivel ?? 0
                                                                const valorAtual = quantidadesEditadas[itemId] ?? String(quantidadeOriginal)
                                                                const maxQuantidade = quantidadeOriginal + quantidadeDisponivel

                                                                return (
                                                                    <TableRow key={itemId}>
                                                                        <TableCell className="font-medium">{itemRemessa.produto?.nome ?? "Produto"}</TableCell>
                                                                        <TableCell>{itemRemessa.produto?.tamanho ?? "-"}</TableCell>
                                                                        <TableCell>{itemRemessa.produto?.cor?.nome ?? "-"}</TableCell>
                                                                        <TableCell>{itemRemessa.lote?.codigoLote ?? "-"}</TableCell>
                                                                        <TableCell className="text-right">{quantidadeOriginal}</TableCell>
                                                                        <TableCell>
                                                                            <div className="ml-auto w-28">
                                                                                <Input
                                                                                    id={`quantidade-remessa-${itemId}`}
                                                                                    type="number"
                                                                                    min={0}
                                                                                    max={maxQuantidade}
                                                                                    value={valorAtual}
                                                                                    onChange={(e) => handleQuantidadeRemessaChange(itemId, e.target.value)}
                                                                                    className="text-right"
                                                                                />
                                                                                <p className="mt-1 text-[11px] text-muted-foreground text-right">
                                                                                    Max: {maxQuantidade}
                                                                                </p>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                size="sm"
                                                                                onClick={() => handleRemoverItem(itemId)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Remover
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="estoque" className="mt-0">
                            <div className="rounded-md border">
                                <ScrollArea className="h-[60vh]">
                                    {isFetching ? (
                                        <div className="flex min-h-70 items-center justify-center">
                                            <Spinner className="size-8" />
                                        </div>
                                    ) : estoquesDisponiveisFiltrados.length === 0 ? (
                                        <div className="flex min-h-70 items-center justify-center px-6 text-sm text-muted-foreground">
                                            Todo o estoque visível já está na remessa.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 p-4">
                                            {estoquesDisponiveisFiltrados.map((estoque) => {
                                                const quantidadeAtual = quantidadesEditadas[estoque.id] ?? "1"
                                                const maxQuantidade = estoque.quantidadeDisponivel

                                                return (
                                                    <div
                                                        key={estoque.id}
                                                        className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_160px_160px] md:items-center"
                                                    >
                                                        <div className="min-w-0 space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="truncate text-sm font-medium">
                                                                    {estoque.produto.nome}
                                                                </p>
                                                                <Badge variant="secondary" className="font-mono text-[11px]">
                                                                    {estoque.produto.sku}
                                                                </Badge>
                                                                <Badge variant="outline">Disponível: {estoque.quantidadeDisponivel}</Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                                <span>Tamanho: {estoque.tamanho.nome}</span>
                                                                <span>Cor: {estoque.cor.nome}</span>
                                                                <span>Lote: {estoque.lote.codigoLote}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Label htmlFor={`quantidade-estoque-${estoque.id}`}>Quantidade para adicionar</Label>
                                                            <Input
                                                                id={`quantidade-estoque-${estoque.id}`}
                                                                type="number"
                                                                min={1}
                                                                max={maxQuantidade}
                                                                value={quantidadeAtual}
                                                                onChange={(e) => handleQuantidadeDisponivelChange(estoque, e.target.value)}
                                                            />
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Máximo permitido: {maxQuantidade}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-end">
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleAdicionarItem(estoque)}
                                                                disabled={maxQuantidade <= 0}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Adicionar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Use a quantidade final para que o sistema calcule automaticamente o que precisa ser adicionado ou removido.
                        </p>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSalvar}
                                disabled={!temAlteracoes || putDirecionamentoItens.isPending}
                            >
                                Salvar alterações
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}