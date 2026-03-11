"use client";

import React from "react";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
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
  ordem: number;
};

type Aggregate = {
  key: string;
  label: string;
  color?: string;
  products: Map<string, ProductMeta>;
  sizes: Map<string, SizeMeta>;
  cells: Map<string, Map<string, number>>;
};

interface ResumoGradePorCorTabsProps {
  lotes: ApiLoteProducaoResponse[];
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
  sizeOrdem: number,
  value: number,
) {
  if (!aggregate.products.has(productId)) {
    aggregate.products.set(productId, { nome: productNome, sku });
  }

  if (!aggregate.sizes.has(sizeId)) {
    aggregate.sizes.set(sizeId, {
      nome: sizeNome,
      ordem: sizeOrdem,
    });
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

function AggregateTable({ aggregate }: { aggregate: Aggregate }) {
  const products = React.useMemo(
    () =>
      Array.from(aggregate.products.entries()).sort((a, b) =>
        a[1].nome.localeCompare(b[1].nome, "pt-BR", { sensitivity: "base", numeric: true }),
      ),
    [aggregate],
  );

  const sizes = React.useMemo(
    () =>
      Array.from(aggregate.sizes.entries()).sort((a, b) => {
        if (a[1].ordem !== b[1].ordem) return a[1].ordem - b[1].ordem;
        return a[1].nome.localeCompare(b[1].nome, "pt-BR", { sensitivity: "base", numeric: true });
      }),
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

export function ResumoGradePorCorTabs({ lotes }: ResumoGradePorCorTabsProps) {
  const { totalAggregate, colorAggregates } = React.useMemo(() => {
    const total = createAggregate("total-geral", "Total Geral");
    const byColor = new Map<string, Aggregate>();

    (lotes || []).forEach((lote) => {
      (lote.materiais || []).forEach((material) => {
        (material.cores || []).forEach((cor) => {
          const colorKey = cor.corId || `${cor.nome || "sem-cor"}-${cor.codigoHex || ""}`;
          const colorLabel = cor.nome || "Sem nome";

          if (!byColor.has(colorKey)) {
            byColor.set(colorKey, createAggregate(colorKey, colorLabel, cor.codigoHex));
          }

          const colorAggregate = byColor.get(colorKey)!;
          const qtdFolhas = Number(cor.qtdFolhas || 0);

          (cor.gradeLote || []).forEach((item) => {
            const productId = item.produtoId || "";
            const productNome = item.produtoNome || item.produto?.nome || "Produto";
            const sku = item.sku || item.produto?.sku || "-";
            const sizeId = item.tamanhoId || "";
            const sizeNome = item.tamanhoNome || item.tamanho?.nome || "Tamanho";
            const sizeOrdem = Number(item.tamanho?.ordem || 999);
            const quantidadePlanejada = Number(item.quantidadePlanejada || 0);
            const quantidadeReal = qtdFolhas * quantidadePlanejada;

            if (!productId || !sizeId) return;

            addValue(
              colorAggregate,
              productId,
              productNome,
              sku,
              sizeId,
              sizeNome,
              sizeOrdem,
              quantidadeReal,
            );

            addValue(
              total,
              productId,
              productNome,
              sku,
              sizeId,
              sizeNome,
              sizeOrdem,
              quantidadeReal,
            );
          });
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
  }, [lotes]);

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
      <Badge variant="outline">Quantidade real = qtdFolhas x quantidadePlanejada</Badge>

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
