'use client';

import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DirecionamentoFormValues } from '@/schemas/direcionamento-schema';
import { ApiLoteProducaoResponse } from '@/hooks/queries/useProducao';

type MateriaisLote = NonNullable<ApiLoteProducaoResponse['materiais']>;
type MaterialLote = MateriaisLote[number];
type CorLote = NonNullable<MaterialLote['cores']>[number];
type GradeLoteItem = NonNullable<CorLote['gradeLote']>[number];

interface DirecionamentoGradeEditavelProps {
  materiais: MateriaisLote;
  direcionamentoIndex: number;
}

interface TamanhoGrade {
  id: string;
  nome: string;
  ordem?: number;
}

interface ProdutoGrade {
  id: string;
  nome: string;
  sku?: string;
}

interface CorGradeEditavel {
  corId: string;
  nome: string;
  codigoHex?: string;
  tamanhos: TamanhoGrade[];
  produtos: ProdutoGrade[];
  disponivelMap: Map<string, number>; // key: `${produtoId}:${tamanhoId}`
}

interface DirecionamentoItemField {
  id: string;
  corId: string;
  produtoId: string;
  tamanhoId: string;
  quantidade: number;
}

export function DirecionamentoGradeEditavel({ materiais, direcionamentoIndex }: DirecionamentoGradeEditavelProps) {
  const { control, register } = useFormContext<DirecionamentoFormValues>();

  const { fields, replace } = useFieldArray({
    control,
    name: `direcionamentos.${direcionamentoIndex}.items` as const,
  });

  const typedFields = fields as DirecionamentoItemField[];

  const coresGrade = React.useMemo<CorGradeEditavel[]>(() => {
    const result: CorGradeEditavel[] = [];

    materiais.forEach((material) => {
      (material.cores || []).forEach((cor) => {
        if (!cor.corId) return;

        const tamanhosMap = new Map<string, TamanhoGrade>();
        const produtosMap = new Map<string, ProdutoGrade>();
        const disponivelMap = new Map<string, number>();

        (cor.gradeLote || []).forEach((gradeItem: GradeLoteItem) => {
          if (!gradeItem.produtoId || !gradeItem.tamanhoId) return;

          const produtoId = gradeItem.produtoId;
          const tamanhoId = gradeItem.tamanhoId;
          const produtoNome = gradeItem.produtoNome || gradeItem.produto?.nome || 'Produto';
          const tamanhoNome = gradeItem.tamanhoNome || gradeItem.tamanho?.nome || '-';

          if (!produtosMap.has(produtoId)) {
            produtosMap.set(produtoId, {
              id: produtoId,
              nome: produtoNome,
              sku: gradeItem.sku || gradeItem.produto?.sku,
            });
          }

          if (!tamanhosMap.has(tamanhoId)) {
            tamanhosMap.set(tamanhoId, {
              id: tamanhoId,
              nome: tamanhoNome,
              ordem: gradeItem.tamanho?.ordem,
            });
          }

          const key = `${produtoId}:${tamanhoId}`;
          disponivelMap.set(key, (disponivelMap.get(key) || 0) + (gradeItem.quantidadePlanejada || 0));
        });

        if (produtosMap.size === 0) return;

        const produtos = Array.from(produtosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        const tamanhos = Array.from(tamanhosMap.values()).sort((a, b) => {
          const ordemA = a.ordem ?? Number.MAX_SAFE_INTEGER;
          const ordemB = b.ordem ?? Number.MAX_SAFE_INTEGER;
          if (ordemA !== ordemB) return ordemA - ordemB;
          return a.nome.localeCompare(b.nome);
        });

        result.push({
          corId: cor.corId,
          nome: cor.nome || cor.corId,
          codigoHex: cor.codigoHex,
          tamanhos,
          produtos,
          disponivelMap,
        });
      });
    });

    return result;
  }, [materiais]);

  React.useEffect(() => {
    if (typedFields.length > 0 || coresGrade.length === 0) return;

    const initialItems = coresGrade.flatMap((cor) =>
      cor.produtos.flatMap((produto) =>
        cor.tamanhos.map((tamanho) => ({
          corId: cor.corId,
          produtoId: produto.id,
          tamanhoId: tamanho.id,
          quantidade: 0,
        }))
      )
    );

    replace(initialItems);
  }, [coresGrade, replace, typedFields.length]);

  if (coresGrade.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
        <span className="text-xs font-bold uppercase">Grade de envio</span>
        <Badge variant="secondary">Preencha as quantidades por cor</Badge>
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {coresGrade.map((cor) => (
            <CarouselItem key={cor.corId}>
              <div className="p-1">
                <div className="rounded-xl border bg-card shadow-sm">
                  {/* Header da Cor */}
                  <div className="flex items-center gap-2 border-b bg-muted/30 p-3">
                    {cor.codigoHex && (
                      <div
                        className="h-4 w-4 shrink-0 rounded-full border shadow-sm"
                        style={{ backgroundColor: cor.codigoHex }}
                      />
                    )}
                    <span className="text-sm font-bold">{cor.nome}</span>
                    <Badge variant="outline" className="ml-auto">
                      {cor.tamanhos.length} tamanhos &middot; {cor.produtos.length} produtos
                    </Badge>
                  </div>

                  {/* Tabela editável */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-45">Produto</TableHead>
                          {cor.tamanhos.map((tamanho) => (
                            <TableHead key={tamanho.id} className="min-w-20 text-center">
                              {tamanho.nome}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cor.produtos.map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell className="py-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none">{produto.nome}</span>
                                {produto.sku && (
                                  <span className="mt-1 text-[10px] text-muted-foreground">{produto.sku}</span>
                                )}
                              </div>
                            </TableCell>

                            {cor.tamanhos.map((tamanho) => {
                              const fieldIndex = typedFields.findIndex(
                                (f) =>
                                  f.corId === cor.corId &&
                                  f.produtoId === produto.id &&
                                  f.tamanhoId === tamanho.id,
                              );
                              const disponivel = cor.disponivelMap.get(`${produto.id}:${tamanho.id}`) ?? 0;

                              if (fieldIndex < 0) {
                                return (
                                  <TableCell key={tamanho.id} className="text-center text-muted-foreground">
                                    -
                                  </TableCell>
                                );
                              }

                              const inputPath =
                                `direcionamentos.${direcionamentoIndex}.items.${fieldIndex}.quantidade` as const;

                              return (
                                <TableCell key={tamanho.id} className="p-2 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <Input
                                      type="number"
                                      className="h-8 w-16 p-1 text-center text-xs"
                                      min={0}
                                      max={disponivel}
                                      placeholder={`máx ${disponivel}`}
                                      {...register(inputPath, {
                                        setValueAs: (value) => {
                                          const parsed = Number(value);
                                          if (!Number.isFinite(parsed) || parsed < 0) return 0;
                                          return Math.floor(parsed);
                                        },
                                      })}
                                    />
                                    <span className="text-[9px] text-muted-foreground">Disp: {disponivel}</span>
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-2 flex items-center justify-end gap-2 pr-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
}
