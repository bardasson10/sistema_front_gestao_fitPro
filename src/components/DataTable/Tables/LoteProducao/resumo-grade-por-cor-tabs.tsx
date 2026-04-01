"use client";

import React from "react";
import {
    IResumoPorCorProduto,
    IResumoPorCorResponse,
    IResumoPorCorSecao,
} from "@/types/Lote";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaginatedResponse } from "@/types/production";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumoGradePorCorTabsProps {
    resumo?: IResumoPorCorResponse;
    pagination?: PaginatedResponse;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    isLoading?: boolean;
}

function getQuantidadeByTamanho(produto: IResumoPorCorProduto, tamanhoId: string): number {
    return produto.linhas.find((linha) => linha.tamanhoId === tamanhoId)?.quantidade || 0;
}

function AggregateTable({ secao }: { secao: IResumoPorCorSecao }) {
    const produtos = React.useMemo(
        () =>
            [...(secao.produtos || [])].sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base", numeric: true }),
            ),
        [secao.produtos],
    );

    const tamanhos = React.useMemo(
        () =>
            [...(secao.tamanhos || [])]
                .filter((size) => size.total > 0)
                .sort((a, b) => {
                    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
                    return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base", numeric: true });
                }),
        [secao.tamanhos],
    );

    if (produtos.length === 0 || tamanhos.length === 0) {
        return (
            <p className="text-sm text-muted-foreground italic py-2">
                Sem dados de grade para esta selecao.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="min-w-44 font-semibold">Produto</TableHead>
                        {tamanhos.map((size) => (
                            <TableHead key={size.id} className="text-center min-w-20 font-semibold">
                                {size.nome}
                            </TableHead>
                        ))}
                        <TableHead className="text-center min-w-20 font-semibold">Total</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {produtos.map((produto) => (
                        <TableRow key={produto.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span className="text-sm">{produto.nome}</span>
                                    <span className="text-xs text-muted-foreground">{produto.sku}</span>
                                </div>
                            </TableCell>

                            {tamanhos.map((size) => (
                                <TableCell key={size.id} className="text-center text-sm tabular-nums">
                                    {getQuantidadeByTamanho(produto, size.id)}
                                </TableCell>
                            ))}

                            <TableCell className="text-center text-sm font-semibold tabular-nums">
                                {produto.total}
                            </TableCell>
                        </TableRow>
                    ))}

                    <TableRow className="bg-muted/30 font-semibold">
                        <TableCell className="text-sm">Total</TableCell>
                        {tamanhos.map((size) => (
                            <TableCell key={size.id} className="text-center text-sm tabular-nums">
                                {size.total}
                            </TableCell>
                        ))}
                        <TableCell className="text-center text-sm tabular-nums">
                            {secao.grandTotal}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}

function ResumoSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-96" />

            <div className="space-y-6">
                <section className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <div className="overflow-x-auto rounded-lg border">
                        <div className="space-y-2 p-4">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <Skeleton className="h-4 w-44" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <Skeleton className="h-5 w-40" />

                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="rounded-lg border p-4 space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <div className="space-y-2">
                                    {Array.from({ length: 4 }).map((_, cellIdx) => (
                                        <div key={cellIdx} className="flex gap-4">
                                            <Skeleton className="h-4 w-44" />
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export function ResumoGradePorCorTabs({
    resumo,
    pagination,
    onPageChange,
    onLimitChange,
    isLoading,
}: ResumoGradePorCorTabsProps) {
    const [selectedColorKey, setSelectedColorKey] = React.useState<string>("all");

    const totalGeral = resumo?.totalGeral;
    const cores = resumo?.cores || [];
    const hasAnyData = (totalGeral?.grandTotal || 0) > 0;

    const coresFiltradas = React.useMemo(() => {
        if (selectedColorKey === "all") return cores;
        return cores.filter((color) => color.id === selectedColorKey);
    }, [cores, selectedColorKey]);

    if (isLoading) {
        return <ResumoSkeleton />;
    }

    if (!hasAnyData || !totalGeral) {
        return (
            <p className="text-sm text-muted-foreground italic py-2">
                Ainda nao ha grade com quantidade real para exibir.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Badge variant="outline">Quantidade planejada = qtdFolhas x qtdMultiplicadorGrade</Badge>

            <div className="space-y-6">
                <section className="space-y-3">
                    <h4 className="text-sm font-semibold">Total Geral</h4>
                    <AggregateTable secao={totalGeral} />
                </section>

                <section className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-sm font-semibold">Resumo por cor</h4>
                        <div className="w-full sm:w-72">
                            <Select value={selectedColorKey} onValueChange={setSelectedColorKey}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por cor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as cores</SelectItem>
                                    {cores.map((color) => (
                                        <SelectItem key={color.id} value={color.id}>
                                            {color.nome} ({color.total} pecas)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {coresFiltradas.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic py-2">
                            Nenhuma cor encontrada para o filtro selecionado.
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {coresFiltradas.map((color) => (
                                <section key={color.id} className="space-y-3 rounded-lg border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <CircleColorView color={color.codigoHex} height={14} width={14} />
                                            <h5 className="text-sm font-semibold">{color.nome}</h5>
                                        </div>
                                        <Badge variant="secondary">{color.total} pecas</Badge>
                                    </div>

                                    <AggregateTable secao={{ produtos: color.produtos, tamanhos: color.tamanhos, grandTotal: color.total }} />
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {pagination && pagination.pages > 0 && (
                <div className="mt-2 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground text-sm">
                        Pagina {pagination.page} de {pagination.pages} ({pagination.total} cores)
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Cores por pagina</span>
                            <Select
                                value={String(pagination.limit || 10)}
                                onValueChange={(value) => onLimitChange?.(Number(value))}
                            >
                                <SelectTrigger className="h-9 w-20">
                                    <SelectValue placeholder={String(pagination.limit || 10)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 10, 20, 30, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={String(pageSize)}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
