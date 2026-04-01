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

interface ResumoGradePorCorTabsProps {
    resumo?: IResumoPorCorResponse;
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

export function ResumoGradePorCorTabs({ resumo }: ResumoGradePorCorTabsProps) {
    const [selectedColorKey, setSelectedColorKey] = React.useState<string>("all");

    const totalGeral = resumo?.totalGeral;
    const cores = resumo?.cores || [];
    const hasAnyData = (totalGeral?.grandTotal || 0) > 0;

    const coresFiltradas = React.useMemo(() => {
        if (selectedColorKey === "all") return cores;
        return cores.filter((color) => color.id === selectedColorKey);
    }, [cores, selectedColorKey]);

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
        </div>
    );
}
