"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import { CalendarIcon, Package, Truck, Plus, Trash2, Search, List, Ban } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
    DirecionamentoRequestBodyPayload,
    DirecionamentoRemessa,
    DirecionamentoProducaoInternaRequestBodyPayload,
} from "@/types/Direcionamento"
import type { EstoqueCorte } from "@/types/EstoqueCorte"
import { Faccao, ServicesValues } from "@/types/Faccao"
import { PaginatedResponse } from "@/types/production"
import { UseMutationResult } from "@tanstack/react-query"
import { Spinner } from "@/components/ui/spinner"
import { useGetEstoqueCorte, type EstoqueCorteFiltros } from "@/hooks/queries/Estoque/useEstoque-Corte"


interface ItemSelecionado extends ItemDirecionamento {
    estoqueCorte: EstoqueCorte
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
                            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
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
                        <Button type="button" variant="ghost" className="w-full" onClick={() => onChange("")}>Limpar seleção</Button>
                    ) : null}
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface CriarRemessaComponentProps {
    dataFaccoes: Partial<Faccao>[];
    dataEstoqueCorte: EstoqueCorte[];
    isProducaoInterna?: boolean;
    usePostCriarDirecionamentoRemessa: () => UseMutationResult<{
        data: DirecionamentoRemessa[];
        pagination: PaginatedResponse;
    }, any, DirecionamentoRequestBodyPayload, unknown>;
    usePostCriarDirecionamentoProducaoInterna?: () => UseMutationResult<{
        data: DirecionamentoRemessa[];
        pagination: PaginatedResponse;
    }, any, DirecionamentoProducaoInternaRequestBodyPayload, unknown>;
    onRemessaCriada?: () => void | Promise<void>;
}

export function CriarRemessaComponent({
    dataFaccoes,
    dataEstoqueCorte,
    isProducaoInterna = false,
    usePostCriarDirecionamentoRemessa,
    usePostCriarDirecionamentoProducaoInterna,
    onRemessaCriada,
}: CriarRemessaComponentProps) {
    const { mutate: criarRemessa, isPending: isCreating } = usePostCriarDirecionamentoRemessa();
    const { mutate: criarProducaoInterna, isPending: isCreatingInterna } =
        usePostCriarDirecionamentoProducaoInterna?.() ?? {
            mutate: undefined,
            isPending: false,
        };
    const [faccaoId, setFaccaoId] = useState<string>("")
    const [tipoServico, setTipoServico] = useState<string>("costura")
    const [filtroSku, setFiltroSku] = useState("")
    const [filtroTamanho, setFiltroTamanho] = useState("")
    const [filtroCor, setFiltroCor] = useState("")
    const [filtroLote, setFiltroLote] = useState("")
    const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([])
    const [quantidadeInputs, setQuantidadeInputs] = useState<Record<string, string>>({})
    const [busca, setBusca] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 12
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [observacao, setObservacao] = useState<string>("");

    const [filtroProdutoId, setFiltroProdutoId] = useState("")
    const [filtroTamanhoId, setFiltroTamanhoId] = useState("")
    const [filtroCorId, setFiltroCorId] = useState("")
    const [filtroLoteId, setFiltroLoteId] = useState("")

    const filtrosApiEstoque = useMemo<EstoqueCorteFiltros>(
        () => ({
            produtoId: filtroProdutoId || undefined,
            tamanhoId: filtroTamanhoId || undefined,
            corId: filtroCorId || undefined,
            loteProducaoId: filtroLoteId || undefined,
            limit: 10000,
        }),
        [filtroCorId, filtroLoteId, filtroProdutoId, filtroTamanhoId],
    )

    const { data: dadosEstoqueApi } = useGetEstoqueCorte(filtrosApiEstoque)
    const estoqueBase = dadosEstoqueApi
    const estoqueFiltradoApi = dadosEstoqueApi

    const skuOptions = useMemo(
        () => Array.from(new Set(estoqueBase.map((estoque) => estoque.produto.sku))).sort(),
        [estoqueBase]
    )

    const tamanhoOptions = useMemo(
        () => Array.from(new Set(estoqueBase.map((estoque) => estoque.tamanho.nome))).sort(),
        [estoqueBase]
    )

    const corOptions = useMemo(
        () => Array.from(new Set(estoqueBase.map((estoque) => estoque.cor.nome))).sort(),
        [estoqueBase]
    )

    const loteOptions = useMemo(
        () => Array.from(new Set(estoqueBase.map((estoque) => estoque.lote.codigoLote))).sort(),
        [estoqueBase]
    )

    const handleFiltroSkuChange = (sku: string) => {
        setFiltroSku(sku)
        setFiltroProdutoId(estoqueBase.find((estoque) => estoque.produto.sku === sku)?.produto.id ?? "")
    }

    const handleFiltroTamanhoChange = (tamanho: string) => {
        setFiltroTamanho(tamanho)
        setFiltroTamanhoId(estoqueBase.find((estoque) => estoque.tamanho.nome === tamanho)?.tamanho.id ?? "")
    }

    const handleFiltroCorChange = (cor: string) => {
        setFiltroCor(cor)
        setFiltroCorId(estoqueBase.find((estoque) => estoque.cor.nome === cor)?.cor.id ?? "")
    }

    const handleFiltroLoteChange = (lote: string) => {
        setFiltroLote(lote)
        setFiltroLoteId(estoqueBase.find((estoque) => estoque.lote.codigoLote === lote)?.lote.id ?? "")
    }

    useEffect(() => {
        setPage(1)
    }, [busca, filtroSku, filtroTamanho, filtroCor, filtroLote])

    const normalizeText = (value?: string | null) => (value ?? "").trim().toLowerCase()

    const matchesSearch = (estoque: EstoqueCorte, searchValue: string) => {
        const normalizedSearch = normalizeText(searchValue)
        if (!normalizedSearch) return true

        const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean)
        const searchableFields = [
            estoque.produto.nome,
            estoque.produto.sku,
            estoque.tamanho.nome,
            estoque.cor.nome,
            estoque.lote.codigoLote,
        ].map(normalizeText)

        return searchTokens.every((token) =>
            searchableFields.some((field) => field.includes(token))
        )
    }


    const estoquesFiltrados = useMemo(() => {
        if (!busca && !filtroSku && !filtroTamanho && !filtroCor && !filtroLote) return estoqueFiltradoApi
        return estoqueFiltradoApi.filter((e) => {
            const correspondeBusca = matchesSearch(e, busca)

            const correspondeSku = !filtroSku || e.produto.sku === filtroSku
            const correspondeTamanho = !filtroTamanho || e.tamanho.nome === filtroTamanho
            const correspondeCor = !filtroCor || e.cor.nome === filtroCor
            const correspondeLote = !filtroLote || e.lote.codigoLote === filtroLote

            return (
                correspondeBusca &&
                correspondeSku &&
                correspondeTamanho &&
                correspondeCor &&
                correspondeLote
            )
        })
    }, [busca, filtroSku, filtroTamanho, filtroCor, filtroLote, estoqueFiltradoApi])

    const estoquesAgrupadosPorSku = useMemo(() => {
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

    const totalPaginas = Math.max(1, Math.ceil(estoquesAgrupadosPorSku.length / pageSize))
    const gruposPaginados = useMemo(
        () => estoquesAgrupadosPorSku.slice((page - 1) * pageSize, page * pageSize),
        [estoquesAgrupadosPorSku, page],
    )

    const totalItens = useMemo(() => {
        return itensSelecionados.reduce((acc, item) => acc + item.quantidade, 0)
    }, [itensSelecionados])

    const itensSelecionadosAgrupadosPorSku = useMemo(() => {
        // Agrupar por SKU
        const skuGroups = new Map<string, typeof itensSelecionados>()
        itensSelecionados.forEach((item) => {
            const sku = item.estoqueCorte.produto.sku
            if (!skuGroups.has(sku)) {
                skuGroups.set(sku, [])
            }
            skuGroups.get(sku)!.push(item)
        })

        // Calcular disponível total por SKU (somando de todos os estoques com esse SKU)
        const skuDisponivel = new Map<string, number>()
        estoqueBase.forEach((estoque) => {
            const sku = estoque.produto.sku
            if (!skuDisponivel.has(sku)) {
                skuDisponivel.set(sku, 0)
            }
            skuDisponivel.set(sku, skuDisponivel.get(sku)! + estoque.quantidadeDisponivel)
        })

        return Array.from(skuGroups.entries()).map(([sku, items]) => ({
            sku,
            items,
            disponivel: skuDisponivel.get(sku) || 0,
        }))
    }, [itensSelecionados, estoqueBase])

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

    const handleRemoveSku = (sku: string) => {
        // Remove todos os itens com esse SKU
        const itemsToRemove = itensSelecionados
            .filter((item) => item.estoqueCorte.produto.sku === sku)
            .map((item) => item.estoqueCorteId)

        // Limpar inputs de quantidade
        setQuantidadeInputs((prev) => {
            const newInputs = { ...prev }
            itemsToRemove.forEach((id) => {
                delete newInputs[id]
            })
            return newInputs
        })

        // Remover itens
        setItensSelecionados((prev) =>
            prev.filter((item) => item.estoqueCorte.produto.sku !== sku)
        )
    }

    const isItemSelecionado = (estoqueCorteId: string) => {
        return itensSelecionados.some((item) => item.estoqueCorteId === estoqueCorteId)
    }

    const getQuantidadeSelecionada = (estoqueCorteId: string) => {
        return itensSelecionados.find((item) => item.estoqueCorteId === estoqueCorteId)?.quantidade || 0
    }

    const canSubmit = isProducaoInterna
        ? itensSelecionados.length > 0
        : !!(faccaoId && tipoServico && itensSelecionados.length > 0)

    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsSubmitting(true)

        if (isProducaoInterna) {
            if (!criarProducaoInterna) {
                setIsSubmitting(false)
                return
            }

            const payloadInterna: DirecionamentoProducaoInternaRequestBodyPayload = {
                tipoServico: tipoServico.toLocaleLowerCase(),
                observacao,
                items: itensSelecionados.map((item) => ({
                    estoqueCorteId: item.estoqueCorteId,
                    quantidade: item.quantidade,
                })),
            }

            criarProducaoInterna(payloadInterna, {
                onSuccess: () => {
                    onRemessaCriada?.()
                    setTipoServico("costura")
                    setItensSelecionados([])
                    setQuantidadeInputs({})
                    setObservacao("")
                    setIsSubmitting(false)
                },
                onError: () => {
                    setIsSubmitting(false)
                }
            })

            return
        }

        const dataSaida = new Date()
        
        const faccao = dataFaccoes.find((f) => f.id === faccaoId)
        const prazoMedio = faccao?.prazoMedio ?? faccao?.prazoMedioDias ?? 0
        const dataPrevisaoRetorno = new Date(dataSaida)
        dataPrevisaoRetorno.setDate(dataPrevisaoRetorno.getDate() + prazoMedio)

        const payload: DirecionamentoRequestBodyPayload = {
            direcionamentos: [
                {
                    faccaoId: faccaoId,
                    tipoServico: tipoServico.toLocaleLowerCase(),
                    dataSaida: dataSaida.toISOString(),
                    dataPrevisaoRetorno: dataPrevisaoRetorno.toISOString(),
                    items: itensSelecionados.map((item) => ({
                        estoqueCorteId: item.estoqueCorteId,
                        quantidade: item.quantidade,
                    })),
                },
            ],
        }

        criarRemessa(payload, {
            onSuccess: () => {
                onRemessaCriada?.()
                // Reset form
                setFaccaoId("")
                setTipoServico("costura")
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
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Direcione cortes para facções de costura atráves da crição de uma remessa
                    </p>
                </div>
                <Link href="/remessas-direcionadas" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                        <List className="mr-2 h-4 w-4" />
                        Ver Remessas
                    </Button>
                </Link>
            </div>

            {/* Form Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Coluna 1: Configurações */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Truck className="h-4 w-4" />
                            Configurações da Remessa
                        </CardTitle>
                        <CardDescription>
                            Selecione a facção e datas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {!isProducaoInterna ? (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="faccao">Facção</Label>
                                <Select value={faccaoId} onValueChange={setFaccaoId}>
                                    <SelectTrigger id="faccao">
                                        <SelectValue placeholder="Selecione uma facção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dataFaccoes.map((faccao) => (
                                            <SelectItem key={faccao.id} value={faccao.id ?? ""}>
                                                {faccao.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                            <Label>Data de Hoje</Label>
                            <div className="relative">
                                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    disabled
                                    readOnly
                                    className="pl-9"
                                    value={format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                            <Input
                                id="tipoServico"
                                disabled
                                readOnly
                                className="bg-muted capitalize"
                                value="Costura"
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

                        {/* Botão de Submit */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={isCreating || isCreatingInterna || isSubmitting}
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

                {/* Coluna 2: Seleção de Itens */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="h-4 w-4" />
                                    Estoque de Corte Disponível
                                </CardTitle>
                                <CardDescription>
                                    Selecione os itens para a remessa
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
                                onChange={handleFiltroSkuChange}
                            />
                            <SearchableOptionFilter
                                label="Cor"
                                placeholder="Buscar cor"
                                value={filtroCor}
                                options={corOptions}
                                onChange={handleFiltroCorChange}
                            />
                            <SearchableOptionFilter
                                label="Tamanho"
                                placeholder="Buscar tamanho"
                                value={filtroTamanho}
                                options={tamanhoOptions}
                                onChange={handleFiltroTamanhoChange}
                            />
                            <SearchableOptionFilter
                                label="Lote"
                                placeholder="Buscar lote"
                                value={filtroLote}
                                options={loteOptions}
                                onChange={handleFiltroLoteChange}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-80 overflow-auto rounded-md border sm:max-h-85">
                            <Table className="min-w-190">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Tamanho</TableHead>
                                        <TableHead>Cor</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead className="text-right">Disponível</TableHead>
                                        <TableHead className="text-right">Qtd</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gruposPaginados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        gruposPaginados.map((grupo) => (
                                            <Fragment key={grupo.sku}>
                                                <TableRow className="bg-muted/40">
                                                    <TableCell colSpan={7} className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{estoque.produto.nome}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {estoque.produto.sku}
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
                                                                        className="h-8 w-20 text-right ml-auto"
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

                        {estoquesAgrupadosPorSku.length > pageSize && (
                            <div className="flex flex-col gap-3 border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {Math.min((page - 1) * pageSize + 1, estoquesAgrupadosPorSku.length)}-
                                    {Math.min(page * pageSize, estoquesAgrupadosPorSku.length)} de {estoquesAgrupadosPorSku.length} grupos
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={page <= 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Página {page} de {totalPaginas}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((current) => Math.min(totalPaginas, current + 1))}
                                        disabled={page >= totalPaginas}
                                    >
                                        Próxima
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resumo e Ações */}
            {itensSelecionados.length > 0 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Itens Selecionados</CardTitle>
                        <CardDescription>
                            {itensSelecionados.length} item(s) - Total: {totalItens} peças
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {itensSelecionadosAgrupadosPorSku.map(({ sku, items, disponivel }) => (
                                <div key={sku} className="space-y-2 rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            SKU {sku} - {items.length} item(ns) - {disponivel} disponível(is)
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSku(sku)}
                                            className="rounded-full p-0.5 hover:bg-destructive/20"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((item) => (
                                            <Badge
                                                key={item.estoqueCorteId}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {item.estoqueCorte.tamanho.nome} - {item.estoqueCorte.cor.nome}
                                                <span className="ml-1 font-semibold">({item.quantidade})</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}


        </div>
    )
}
