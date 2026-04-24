"use client"

import { useState, useMemo, useEffect } from "react"
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
import { UseMutationResult } from "@tanstack/react-query"
import { PaginatedResponse } from "@/types/production"
import { Spinner } from "@/components/ui/spinner"


interface ItemSelecionado extends ItemDirecionamento {
    estoqueCorte: EstoqueCorte
}

interface CriarRemessaComponentProps {
    dataFaccoes: Partial<Faccao>[];
    dataEstoqueCorte: EstoqueCorte[];
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
    const [tipoServico, setTipoServico] = useState<string>("")
    const [dataSaida, setDataSaida] = useState<Date | undefined>(new Date())
    const [dataPrevisaoRetorno, setDataPrevisaoRetorno] = useState<Date>()
    const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([])
    const [quantidadeInputs, setQuantidadeInputs] = useState<Record<string, string>>({})
    const [busca, setBusca] = useState("")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isProducaoInterna, setIsProducaoInterna] = useState<boolean>(false);
    const [observacao, setObservacao] = useState<string>("");



    useEffect(() => {
        if (!dataSaida || !faccaoId) {
            setDataPrevisaoRetorno(undefined)
            return
        }

        const faccao = dataFaccoes.find((f) => f.id === faccaoId)
        if (!faccao) {
            setDataPrevisaoRetorno(undefined)
            return
        }

        const prazoMedio = faccao?.prazoMedio ?? faccao?.prazoMedioDias ?? 0
        const novaDataPrevisao = new Date(dataSaida)
        novaDataPrevisao.setDate(novaDataPrevisao.getDate() + prazoMedio)

        setDataPrevisaoRetorno(novaDataPrevisao)
    }, [faccaoId, dataSaida, dataFaccoes])


    const estoquesFiltrados = useMemo(() => {
        if (!busca) return dataEstoqueCorte
        const termo = busca.toLowerCase()
        return dataEstoqueCorte.filter(
            (e) =>
                e.produto.nome.toLowerCase().includes(termo) ||
                e.produto.sku.toLowerCase().includes(termo) ||
                e.tamanho.nome.toLowerCase().includes(termo) ||
                e.cor.nome.toLowerCase().includes(termo) ||
                e.lote.codigoLote.toLowerCase().includes(termo)
        )
    }, [busca])

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

    const canSubmit = isProducaoInterna
        ? itensSelecionados.length > 0
        : !!(faccaoId && tipoServico && dataSaida && dataPrevisaoRetorno && itensSelecionados.length > 0)

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
                    setTipoServico("")
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

        const payload: DirecionamentoRequestBodyPayload = {
            direcionamentos: [
                {
                    faccaoId: faccaoId,
                    tipoServico: tipoServico.toLocaleLowerCase(),
                    dataSaida: dataSaida!.toISOString(),
                    dataPrevisaoRetorno: dataPrevisaoRetorno!.toISOString(),
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
                setTipoServico("")
                setDataSaida(undefined)
                setDataPrevisaoRetorno(undefined)
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
                        <div className="flex items-start gap-3 rounded-md border p-3">
                            <Checkbox
                                id="producao-interna"
                                checked={isProducaoInterna}
                                onCheckedChange={(checked) => {
                                    const value = checked === true
                                    setIsProducaoInterna(value)
                                    if (value) {
                                        setFaccaoId("")
                                        setDataPrevisaoRetorno(undefined)
                                        setTipoServico("costura")
                                    } else {
                                        setTipoServico("")
                                    }
                                }}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="producao-interna" className="cursor-pointer">
                                    Criar como produção interna
                                </Label>
                            </div>
                        </div>

                        {/* Facção */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="faccao">Facção</Label>
                            <Select disabled={isProducaoInterna} value={faccaoId} onValueChange={(value) => {
                                setFaccaoId(value);
                                setTipoServico("");
                            }}>
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

                        {/* Tipo de Serviço */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                            <Select
                                value={tipoServico}
                                onValueChange={setTipoServico}
                                disabled={isProducaoInterna || !faccaoId}
                            >
                                <SelectTrigger id="tipoServico">
                                    <SelectValue
                                        placeholder={
                                            isProducaoInterna
                                                ? "Costura (fixo para produção interna)"
                                                : faccaoId
                                                    ? "Selecione o serviço"
                                                    : "Selecione uma facção primeiro"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {ServicesValues.map((tipo) => (
                                        <SelectItem key={tipo} value={tipo.toLowerCase()} className="capitalize">
                                            {tipo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isProducaoInterna && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="observacao">Observação</Label>
                                <Input
                                    id="observacao"
                                    value={observacao}
                                    onChange={(event) => setObservacao(event.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>
                        )}
{/* 
                        Data de Saída
                        <div className="flex flex-col gap-2">
                            <Label>Data de Saída</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !dataSaida && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dataSaida ? format(dataSaida, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dataSaida}
                                        onSelect={setDataSaida}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div> */}

                        {/* Data de Previsão de Retorno */}
                        {/* <div className="flex flex-col gap-2">
                            <Label>Previsão de Retorno</Label>
                            <div className="relative">
                                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    disabled
                                    readOnly
                                    className="pl-9"
                                    value={
                                        dataPrevisaoRetorno
                                            ? format(dataPrevisaoRetorno, "dd/MM/yyyy", { locale: ptBR })
                                            : "Aguardando Facção"
                                    }
                                />
                            </div>
                        </div> */}

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
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[320px] overflow-auto rounded-md border sm:max-h-[340px]">
                            <Table className="min-w-[760px]">
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
                                    {estoquesFiltrados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        estoquesFiltrados.map((estoque) => {
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
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
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
