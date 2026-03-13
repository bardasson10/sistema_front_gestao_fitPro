'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';

interface GradeItem {
  produtoId: string;
  produtoNome: string;
  tamanhoNome: string;
  quantidadePlanejada: number;
}

interface CorGrade {
  corNome: string;
  codigoHex: string;
  grade: GradeItem[];
}

interface DirecionamentoGradeViewProps {
  materiais: any[]; // Estrutura do seu JSON
}

export function DirecionamentoGradeView({ materiais }: DirecionamentoGradeViewProps) {
  // 1. Processar dados para agrupar por cor e extrair tamanhos únicos para o cabeçalho
  const gradesPorCor = React.useMemo(() => {
    const cores: CorGrade[] = [];
    const todosTamanhos = new Set<string>();

    materiais.forEach((mat) => {
      mat.cores?.forEach((cor: any) => {
        const gradeItems: GradeItem[] = cor.gradeLote || [];
        cores.push({
          corNome: cor.nome,
          codigoHex: cor.codigoHex,
          grade: gradeItems,
        });
        gradeItems.forEach((g) => todosTamanhos.add(g.tamanhoNome));
      });
    });

    return { cores, tamanhosUnicos: Array.from(todosTamanhos) };
  }, [materiais]);

  if (gradesPorCor.cores.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição por Grade e Cor
        </h4>
      </div>

      <Carousel className="w-full">
        <CarouselContent>
          {gradesPorCor.cores.map((cor, idx) => (
            <CarouselItem key={idx}>
              <div className="p-1">
                <div className="rounded-xl border bg-card shadow-sm">
                  {/* Header da Cor */}
                  <div className="flex items-center gap-2 border-b p-3 bg-muted/30">
                    <div 
                      className="h-4 w-4 rounded-full border shadow-sm" 
                      style={{ backgroundColor: cor.codigoHex }} 
                    />
                    <span className="font-bold text-sm">{cor.corNome}</span>
                    <Badge variant="outline" className="ml-auto">
                      {cor.grade.reduce((acc, curr) => acc + curr.quantidadePlanejada, 0)} peças
                    </Badge>
                  </div>

                  {/* Tabela da Grade */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Produto</TableHead>
                          {gradesPorCor.tamanhosUnicos.map((tam) => (
                            <TableHead key={tam} className="text-center">{tam}</TableHead>
                          ))}
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Agrupar por produto dentro da cor */}
                        {Array.from(new Set(cor.grade.map(g => g.produtoNome))).map(prodNome => {
                          const itensProd = cor.grade.filter(g => g.produtoNome === prodNome);
                          const totalProd = itensProd.reduce((acc, curr) => acc + curr.quantidadePlanejada, 0);

                          return (
                            <TableRow key={prodNome}>
                              <TableCell className="font-medium text-xs">{prodNome}</TableCell>
                              {gradesPorCor.tamanhosUnicos.map(tam => {
                                const qtd = itensProd.find(i => i.tamanhoNome === tam)?.quantidadePlanejada || 0;
                                return (
                                  <TableCell key={tam} className="text-center text-sm tabular-nums">
                                    {qtd > 0 ? qtd : '-'}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-right font-bold tabular-nums text-primary">
                                {totalProd}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-end gap-2 mt-2 mr-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
}