"use client"

import { Fragment, useMemo, useState } from "react"
import { Package, Truck, Plus, Trash2, Search, List, Ban } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import type {
    ItemDirecionamento,
    DirecionamentoProducaoInternaRequestBodyPayload,
} from "@/types/Direcionamento"
import type { EstoqueCorte } from "@/types/EstoqueCorte"
import { UseMutationResult } from "@tanstack/react-query"
import { PaginatedResponse } from "@/types/production"
import { Spinner } from "@/components/ui/spinner"


interface ItemSelecionado extends ItemDirecionamento {
    estoqueCorte: EstoqueCorte
}

interface GrupoSku {
    sku: string
    itens: EstoqueCorte[]
    totalDisponivel: number
}

interface OptionFilterProps {
    label: string
    placeholder: string
    value: string
    options: string[]
    onChange: (value: string) => void
}

function SearchableOptionFilter({
    label,
    placeholder,
    value,
    options,
    onChange,
}: OptionFilterProps) {
    const [search, setSearch] = useState("")

    const filteredOptions = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return options
        return options.filter((option) => option.toLowerCase().includes(term))
    }, [options, search])

    const selectedLabel = value || "Todos"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 w-full justify-between text-left font-normal">
                    <span className="truncate">
                        {label}: {selectedLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">Selecionar</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{label}</p>
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={placeholder}
                        />
                    </div>
                    <div className="max-h-56 overflow-auto rounded-md border">
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className={cn(
                                "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                                !value && "bg-accent/60"
                            )}
                        >
                            <span>Todos</span>
                        </button>
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                Nenhum resultado
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const active = option === value

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => onChange(option)}
                                        className={cn(
                                            "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                                            active && "bg-accent/60 font-medium"
                                        )}
                                    >
                                        <span className="truncate">{option}</span>
                                        {active ? <span className="text-xs text-muted-foreground">Selecionado</span> : null}
                                    </button>
                                )
                            })
                        )}
                    </div>
                    {value ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => onChange("")}
                        >
                            Limpar seleção
                        </Button>
                    ) : null}
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface CriarRemessaComponentProps {
    dataEstoqueCorte: EstoqueCorte[];
    usePostCriarDirecionamentoProducaoInterna?: () => UseMutationResult<{
        data: unknown[];
        pagination: PaginatedResponse;
    }, any, DirecionamentoProducaoInternaRequestBodyPayload, unknown>;
    onRemessaCriada?: () => void | Promise<void>;
}

export function CriarRemessaProdInternaComponent({
    dataEstoqueCorte,
    usePostCriarDirecionamentoProducaoInterna,
    onRemessaCriada,
}: CriarRemessaComponentProps) {
    const { mutate: criarProducaoInterna, isPending: isCreatingInterna } =
        usePostCriarDirecionamentoProducaoInterna?.() ?? {
            mutate: undefined,
            isPending: false,
        };
    const [observacao, setObservacao] = useState<string>("")
    const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([])
    const [quantidadeInputs, setQuantidadeInputs] = useState<Record<string, string>>({})
    const [busca, setBusca] = useState("")
    const [filtroSku, setFiltroSku] = useState("")
    const [filtroProduto, setFiltroProduto] = useState("")
    const [filtroTamanho, setFiltroTamanho] = useState("")
    const [filtroCor, setFiltroCor] = useState("")
    const [filtroLote, setFiltroLote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const dataHoje = useMemo(() => new Date(), [])
    const tipoServico = "costura"

    const skuOptions = useMemo(
        () => Array.from(new Set(dataEstoqueCorte.map((estoque) => estoque.produto.sku))).sort(),
        [dataEstoqueCorte]
    )

    const produtoOptions = useMemo(
        () => Array.from(new Set(dataEstoqueCorte.map((estoque) => estoque.produto.nome))).sort(),
        [dataEstoqueCorte]
    )

    const tamanhoOptions = useMemo(
        () => Array.from(new Set(dataEstoqueCorte.map((estoque) => estoque.tamanho.nome))).sort(),
        [dataEstoqueCorte]
    )

    const corOptions = useMemo(
        () => Array.from(new Set(dataEstoqueCorte.map((estoque) => estoque.cor.nome))).sort(),
        [dataEstoqueCorte]
    )

    const loteOptions = useMemo(
        () => Array.from(new Set(dataEstoqueCorte.map((estoque) => estoque.lote.codigoLote))).sort(),
        [dataEstoqueCorte]
    )


    const estoquesFiltrados = useMemo(() => {
        return dataEstoqueCorte.filter((estoque) => {
            const termo = busca.trim().toLowerCase()
            const correspondeBusca =
                !termo ||
                estoque.produto.nome.toLowerCase().includes(termo) ||
                estoque.produto.sku.toLowerCase().includes(termo) ||
                estoque.tamanho.nome.toLowerCase().includes(termo) ||
                estoque.cor.nome.toLowerCase().includes(termo) ||
                estoque.lote.codigoLote.toLowerCase().includes(termo)

            const correspondeSku = !filtroSku || estoque.produto.sku === filtroSku
            const correspondeProduto = !filtroProduto || estoque.produto.nome === filtroProduto
            const correspondeTamanho = !filtroTamanho || estoque.tamanho.nome === filtroTamanho
            const correspondeCor = !filtroCor || estoque.cor.nome === filtroCor
            const correspondeLote = !filtroLote || estoque.lote.codigoLote === filtroLote

            return (
                correspondeBusca &&
                correspondeSku &&
                correspondeProduto &&
                correspondeTamanho &&
                correspondeCor &&
                correspondeLote
            )
        })
    }, [busca, dataEstoqueCorte, filtroCor, filtroLote, filtroProduto, filtroSku, filtroTamanho])

    const estoquesAgrupadosPorSku = useMemo<GrupoSku[]>(() => {
        const grupos = new Map<string, EstoqueCorte[]>()

        estoquesFiltrados.forEach((estoque) => {
            const sku = estoque.produto.sku
            const itens = grupos.get(sku) ?? []
            itens.push(estoque)
            grupos.set(sku, itens)
        })

        return Array.from(grupos.entries())
            .map(([sku, itens]) => ({
                sku,
                itens,
                totalDisponivel: itens.reduce((acc, item) => acc + item.quantidadeDisponivel, 0),
            }))
            .sort((a, b) => a.sku.localeCompare(b.sku))
    }, [estoquesFiltrados])

    const totalItens = useMemo(() => {
        return itensSelecionados.reduce((acc, item) => acc + item.quantidade, 0)
    }, [itensSelecionados])

    const handleToggleItem = (estoque: EstoqueCorte, checked: boolean) => {
        if (checked) {
            setQuantidadeInputs((prev) => ({ ...prev, [estoque.id]: "1" }))
            setItensSelecionados((prev) => [
                ...prev,
                {
                    estoqueCorteId: estoque.id,
                    quantidade: 1,
                    estoqueCorte: estoque,
                },
            ])
        } else {
            setQuantidadeInputs((prev) => {
                const newInputs = { ...prev }
                delete newInputs[estoque.id]
                return newInputs
            })
            setItensSelecionados((prev) =>
                prev.filter((item) => item.estoqueCorteId !== estoque.id)
            )
        }
    }

    const handleQuantidadeChange = (estoqueCorteId: string, quantidade: number) => {
        setItensSelecionados((prev) =>
            prev.map((item) =>
                item.estoqueCorteId === estoqueCorteId
                    ? { ...item, quantidade: Math.max(1, Math.min(quantidade, item.estoqueCorte.quantidadeDisponivel)) }
                    : item
            )
        )
    }

    const handleQuantidadeInputChange = (estoqueCorteId: string, value: string) => {
        if (value !== "" && !/^\d+$/.test(value)) return

        setQuantidadeInputs((prev) => ({ ...prev, [estoqueCorteId]: value }))

        if (value === "") return
        handleQuantidadeChange(estoqueCorteId, Number(value))
    }

    const handleQuantidadeBlur = (estoqueCorteId: string, maxQuantidade: number) => {
        const valorAtual = quantidadeInputs[estoqueCorteId]
        const quantidadeNormalizada = Math.max(
            1,
            Math.min(Number(valorAtual || 1) || 1, maxQuantidade)
        )

        setQuantidadeInputs((prev) => ({ ...prev, [estoqueCorteId]: String(quantidadeNormalizada) }))
        handleQuantidadeChange(estoqueCorteId, quantidadeNormalizada)
    }

    const handleRemoveItem = (estoqueCorteId: string) => {
        setQuantidadeInputs((prev) => {
            const newInputs = { ...prev }
            delete newInputs[estoqueCorteId]
            return newInputs
        })

        setItensSelecionados((prev) =>
            prev.filter((item) => item.estoqueCorteId !== estoqueCorteId)
        )
    }

    const isItemSelecionado = (estoqueCorteId: string) => {
        return itensSelecionados.some((item) => item.estoqueCorteId === estoqueCorteId)
    }

    const getQuantidadeSelecionada = (estoqueCorteId: string) => {
        return itensSelecionados.find((item) => item.estoqueCorteId === estoqueCorteId)?.quantidade || 0
    }

    const canSubmit = itensSelecionados.length > 0

    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsSubmitting(true)

        if (!criarProducaoInterna) {
            setIsSubmitting(false)
            return
        }

        const payloadInterna: DirecionamentoProducaoInternaRequestBodyPayload = {
            tipoServico,
            observacao,
            items: itensSelecionados.map((item) => ({
                estoqueCorteId: item.estoqueCorteId,
                quantidade: item.quantidade,
            })),
        }

        criarProducaoInterna(payloadInterna, {
            onSuccess: () => {
                onRemessaCriada?.()
                setItensSelecionados([])
                setQuantidadeInputs({})
                setObservacao("")
                setIsSubmitting(false)
            },
            onError: () => {
                setIsSubmitting(false)
            }
        })
    }

    return (
        <div className="mt-4 flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Produção interna com costura pré-selecionada e itens agrupados por SKU.
                    </p>
                </div>
                <Link href="/remessas-direcionadas" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                        <List className="mr-2 h-4 w-4" />
                        Ver Remessas
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <Card className="lg:justify-self-start lg:max-w-80">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Truck className="h-4 w-4" />
                            Configurações da Produção
                        </CardTitle>
                        <CardDescription>
                            Dados automáticos da produção interna
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dataHoje">Data de hoje</Label>
                            <Input
                                id="dataHoje"
                                readOnly
                                value={format(dataHoje, "dd/MM/yyyy", { locale: ptBR })}
                                className="bg-muted"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                            <Input
                                id="tipoServico"
                                readOnly
                                value="Costura"
                                className="bg-muted capitalize"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="observacao">Observação</Label>
                            <Input
                                id="observacao"
                                value={observacao}
                                onChange={(event) => setObservacao(event.target.value)}
                                placeholder="Opcional"
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={isCreatingInterna || isSubmitting}
                                className="w-full sm:min-w-32 sm:w-auto"
                            >
                                {isSubmitting ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <Plus className="mr-1 h-4 w-4" />
                                        Criar
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Ban className="mr-1 h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="h-4 w-4" />
                                    Estoque de Corte Disponível
                                </CardTitle>
                                <CardDescription>
                                    Selecione os itens para a produção interna
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produto, SKU, cor..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                            <SearchableOptionFilter
                                label="SKU"
                                placeholder="Buscar SKU"
                                value={filtroSku}
                                options={skuOptions}
                                onChange={setFiltroSku}
                            />
                            {/* <SearchableOptionFilter
                                label="Produto"
                                placeholder="Buscar produto"
                                value={filtroProduto}
                                options={produtoOptions}
                                onChange={setFiltroProduto}
                            /> */}
                            <SearchableOptionFilter
                                label="Cor"
                                placeholder="Buscar cor"
                                value={filtroCor}
                                options={corOptions}
                                onChange={setFiltroCor}
                            />
                            <SearchableOptionFilter
                                label="Tamanho"
                                placeholder="Buscar tamanho"
                                value={filtroTamanho}
                                options={tamanhoOptions}
                                onChange={setFiltroTamanho}
                            />
                            <SearchableOptionFilter
                                label="Lote"
                                placeholder="Buscar lote"
                                value={filtroLote}
                                options={loteOptions}
                                onChange={setFiltroLote}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-80 overflow-auto rounded-md border sm:max-h-85">
                            <Table className="min-w-245">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Tamanho</TableHead>
                                        <TableHead>Cor</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead className="text-right">Disponível</TableHead>
                                        <TableHead className="text-right">Qtd</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {estoquesAgrupadosPorSku.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        estoquesAgrupadosPorSku.map((grupo) => (
                                            <Fragment key={grupo.sku}>
                                                <TableRow className="bg-muted/40">
                                                    <TableCell colSpan={8} className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        SKU {grupo.sku} - {grupo.itens.length} item(ns) - {grupo.totalDisponivel} disponível(is)
                                                    </TableCell>
                                                </TableRow>
                                                {grupo.itens.map((estoque) => {
                                                    const selecionado = isItemSelecionado(estoque.id)
                                                    const quantidade = getQuantidadeSelecionada(estoque.id)

                                                    return (
                                                        <TableRow
                                                            key={estoque.id}
                                                            className={cn(selecionado && "bg-primary/5")}
                                                        >
                                                            <TableCell>
                                                                <Checkbox
                                                                    checked={selecionado}
                                                                    onCheckedChange={(checked) =>
                                                                        handleToggleItem(estoque, checked as boolean)
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium">{estoque.produto.sku}</TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{estoque.produto.nome}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Grupo SKU {grupo.sku}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">{estoque.tamanho.nome}</Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="h-4 w-4 rounded-full border"
                                                                        style={{ backgroundColor: estoque.cor.codigoHex }}
                                                                    />
                                                                    <span>{estoque.cor.nome}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm">{estoque.lote.codigoLote}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {estoque.lote.tecido.nome}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {estoque.quantidadeDisponivel}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {selecionado ? (
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        max={estoque.quantidadeDisponivel}
                                                                        value={quantidadeInputs[estoque.id] ?? String(quantidade)}
                                                                        onChange={(e) => handleQuantidadeInputChange(estoque.id, e.target.value)}
                                                                        onBlur={() => handleQuantidadeBlur(estoque.id, estoque.quantidadeDisponivel)}
                                                                        className="ml-auto h-8 w-20 text-right"
                                                                    />
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </Fragment>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {itensSelecionados.length > 0 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Itens Selecionados</CardTitle>
                        <CardDescription>
                            {itensSelecionados.length} item(s) - Total: {totalItens} peças
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {itensSelecionados.map((item) => (
                                <Badge
                                    key={item.estoqueCorteId}
                                    variant="secondary"
                                    className="flex items-center gap-2 py-1.5 pl-3 pr-1.5"
                                >
                                    <span>
                                        {item.estoqueCorte.produto.nome} - {item.estoqueCorte.tamanho.nome} - {item.estoqueCorte.cor.nome}
                                    </span>
                                    <span className="font-semibold">({item.quantidade})</span>
                                    <button
                                        onClick={() => handleRemoveItem(item.estoqueCorteId)}
                                        className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
