"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ProductMeta = {
  nome: string;
  sku: string;
};

type SizeMeta = {
  nome: string;
  ordem?: number;
};

type Aggregate = {
  key: string;
  label: string;
  color?: string;
  products: Map<string, ProductMeta>;
  sizes: Map<string, SizeMeta>;
  cells: Map<string, Map<string, number>>;
};

interface GradeTotalPorCorTabsProps {
  form: UseFormReturn<LoteProducaoFormValues>;
}

function createAggregate(key: string, label: string, color?: string): Aggregate {
  return {
    key,
    label,
    color,
    products: new Map(),
    sizes: new Map(),
    cells: new Map(),
  };
}

function addValue(
  aggregate: Aggregate,
  productId: string,
  productNome: string,
  sku: string,
  sizeId: string,
  sizeNome: string,
  value: number,
) {
  if (!aggregate.products.has(productId)) {
    aggregate.products.set(productId, { nome: productNome, sku });
  }

  if (!aggregate.sizes.has(sizeId)) {
    aggregate.sizes.set(sizeId, { nome: sizeNome });
  }

  if (!aggregate.cells.has(productId)) {
    aggregate.cells.set(productId, new Map());
  }

  const productSizes = aggregate.cells.get(productId)!;
  const currentValue = productSizes.get(sizeId) || 0;
  productSizes.set(sizeId, currentValue + value);
}

function getCellValue(aggregate: Aggregate, productId: string, sizeId: string): number {
  return aggregate.cells.get(productId)?.get(sizeId) || 0;
}

function getProductTotal(aggregate: Aggregate, productId: string): number {
  const productSizes = aggregate.cells.get(productId);
  if (!productSizes) return 0;

  let total = 0;
  for (const qty of productSizes.values()) {
    total += qty;
  }
  return total;
}

function getSizeTotal(aggregate: Aggregate, sizeId: string): number {
  let total = 0;

  for (const productId of aggregate.products.keys()) {
    total += getCellValue(aggregate, productId, sizeId);
  }

  return total;
}

function getGrandTotal(aggregate: Aggregate): number {
  let total = 0;

  for (const productId of aggregate.products.keys()) {
    total += getProductTotal(aggregate, productId);
  }

  return total;
}

function sortByName<T extends { nome: string }>(a: [string, T], b: [string, T]) {
  return a[1].nome.localeCompare(b[1].nome, "pt-BR", { numeric: true, sensitivity: "base" });
}

function getOrdemTamanho(size: SizeMeta) {
  const fallbackOrder: Record<string, number> = {
    P: 1,
    M: 2,
    G: 3,
    GG: 4,
  };

  const ordemNumerica = Number(size.ordem);

  if (Number.isFinite(ordemNumerica) && ordemNumerica > 0) {
    return ordemNumerica;
  }

  return fallbackOrder[size.nome] ?? Number.MAX_SAFE_INTEGER;
}

function AggregateTable({ aggregate }: { aggregate: Aggregate }) {
  const products = React.useMemo(
    () => Array.from(aggregate.products.entries()).sort(sortByName),
    [aggregate],
  );

  const sizes = React.useMemo(
    () => Array.from(aggregate.sizes.entries()).sort((a, b) => getOrdemTamanho(a[1]) - getOrdemTamanho(b[1])),
    [aggregate],
  );

  if (products.length === 0 || sizes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        Sem dados de grade para esta seleção.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-44 font-semibold">Produto</TableHead>
            {sizes.map(([sizeId, size]) => (
              <TableHead key={sizeId} className="text-center min-w-20 font-semibold">
                {size.nome}
              </TableHead>
            ))}
            <TableHead className="text-center min-w-20 font-semibold">Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map(([productId, product]) => (
            <TableRow key={productId}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-sm">{product.nome}</span>
                  <span className="text-xs text-muted-foreground">{product.sku}</span>
                </div>
              </TableCell>

              {sizes.map(([sizeId]) => (
                <TableCell key={sizeId} className="text-center text-sm tabular-nums">
                  {getCellValue(aggregate, productId, sizeId)}
                </TableCell>
              ))}

              <TableCell className="text-center text-sm font-semibold tabular-nums">
                {getProductTotal(aggregate, productId)}
              </TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-muted/30 font-semibold">
            <TableCell className="text-sm">Total</TableCell>
            {sizes.map(([sizeId]) => (
              <TableCell key={sizeId} className="text-center text-sm tabular-nums">
                {getSizeTotal(aggregate, sizeId)}
              </TableCell>
            ))}
            <TableCell className="text-center text-sm tabular-nums">
              {getGrandTotal(aggregate)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export function GradeTotalPorCorTabs({ form }: GradeTotalPorCorTabsProps) {
  const materiais = form.watch("materiais") || [];

  const { totalAggregate, colorAggregates } = React.useMemo(() => {
    const total = createAggregate("total-geral", "Total Geral");
    const byColor = new Map<string, Aggregate>();

    materiais.forEach((material) => {
      (material.cores || []).forEach((cor) => {
        const colorKey = cor.id || cor.nome;
        const colorLabel = cor.nome || "Sem nome";

        if (!byColor.has(colorKey)) {
          byColor.set(colorKey, createAggregate(colorKey, colorLabel, cor.codigoHex));
        }

        const colorAggregate = byColor.get(colorKey)!;
        const qtdFolhas = Number(cor.qtdFolhas || 0);

        (cor.gradeLote || []).forEach((item) => {
          const productId = item.produtoId || "";
          const productNome = item.produtoNome || "Produto";
          const sku = item.sku || "-";
          const sizeId = item.tamanhoId || "";
          const sizeNome = item.tamanhoNome || "Tamanho";
          const quantidadePlanejada = Number(item.quantidadePlanejada || 0);
          const qtdMultiplicadorGrade = Number(item.qtdMultiplicadorGrade || 0);
          const quantidadeReal = qtdMultiplicadorGrade > 0
            ? qtdFolhas * qtdMultiplicadorGrade
            : quantidadePlanejada;

          if (!productId || !sizeId) return;

          addValue(
            colorAggregate,
            productId,
            productNome,
            sku,
            sizeId,
            sizeNome,
            quantidadeReal,
          );

          addValue(
            total,
            productId,
            productNome,
            sku,
            sizeId,
            sizeNome,
            quantidadeReal,
          );
        });
      });
    });

    const colors = Array.from(byColor.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    );

    return {
      totalAggregate: total,
      colorAggregates: colors,
    };
  }, [materiais]);

  const hasAnyData = getGrandTotal(totalAggregate) > 0;

  if (!hasAnyData) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        Ainda nao ha grade com quantidade real para exibir.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Quantidade real = qtdFolhas x qtdMultiplicadorGrade</Badge>
      </div>

      <Tabs defaultValue="total-geral" className="w-full">
        <TabsList className="flex w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="total-geral">Total Geral</TabsTrigger>
          {colorAggregates.map((color) => (
            <TabsTrigger key={color.key} value={`color-${color.key}`} className="gap-2">
              <CircleColorView color={color.color} height={14} width={14} />
              {color.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="total-geral" className="mt-4">
          <AggregateTable aggregate={totalAggregate} />
        </TabsContent>

        {colorAggregates.map((color) => (
          <TabsContent key={color.key} value={`color-${color.key}`} className="mt-4">
            <AggregateTable aggregate={color} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
