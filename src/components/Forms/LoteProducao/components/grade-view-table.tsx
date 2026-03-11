"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GradeLote } from "../interface-lote-form"

interface GradeViewTableProps {
  produtosSelecionados: string[]
  itens: GradeLote[]
  tamanhos: { id: string; label: string; ordem: number }[]
  produtos: { id: string; label: string; sku: string }[]
  qtdFolhas: number
}

export function GradeViewTable({
  produtosSelecionados,
  itens,
  tamanhos: TAMANHOS,
  produtos: PRODUTOS,
  qtdFolhas,
}: GradeViewTableProps) {
  const produtosUnicos = Array.from(
    new Map(PRODUTOS.map((produto) => [produto.id, produto])).values()
  )

  const produtosSelecionadosUnicos = Array.from(new Set(produtosSelecionados))

  const tamanhosOrdenados = Array.from(
    new Map(TAMANHOS.map((tamanho) => [tamanho.id, tamanho])).values()
  ).sort((a, b) => a.ordem - b.ordem)

  const qtdFolhasValidada = Math.max(0, Number(qtdFolhas) || 0)

  function getQuantidadePlanejada(produtoId: string, tamanhoId: string): number {
    const grade = itens.find((g) => g.produtoId === produtoId && g.tamanhoId === tamanhoId)
    return grade ? grade.quantidadePlanejada : 0
  }

  function getQuantidadeCalculada(produtoId: string, tamanhoId: string): number {
    return getQuantidadePlanejada(produtoId, tamanhoId) * qtdFolhasValidada
  }

  function getTotalProduto(produtoId: string): number {
    return tamanhosOrdenados.reduce(
      (sum, tamanho) => sum + getQuantidadeCalculada(produtoId, tamanho.id),
      0
    )
  }

  function getTotalTamanho(tamanhoId: string): number {
    return produtosSelecionadosUnicos.reduce(
      (sum, produtoId) => sum + getQuantidadeCalculada(produtoId, tamanhoId),
      0
    )
  }

  // Mostra apenas tamanhos que possuem total > 0 na grade atual.
  const tamanhosComValor = tamanhosOrdenados.filter(
    (tamanho) => getTotalTamanho(tamanho.id) > 0
  )

  function getTotalGeral(): number {
    // Soma a partir dos totais exibidos por produto para evitar
    // inflar resultado quando o array de itens vier com duplicidades.
    return produtosSelecionadosUnicos.reduce(
      (sum, produtoId) => sum + getTotalProduto(produtoId),
      0
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Grade de Visualização</h4>
        <span className="text-xs text-muted-foreground">Qtd. Folhas: {qtdFolhasValidada}</span>
      </div>

      {produtosSelecionadosUnicos.length === 0 || tamanhosComValor.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          Nenhum produto adicionado para visualizar a grade.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-40 font-semibold">Produto</TableHead>
                {tamanhosComValor.map((tamanho) => (
                  <TableHead key={tamanho.id} className="text-center min-w-18 font-semibold">
                    {tamanho.label}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-18 font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {produtosSelecionadosUnicos.map((produtoId) => {
                const produto = produtosUnicos.find((p) => p.id === produtoId)
                if (!produto) return null

                return (
                  <TableRow key={produtoId}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{produto.label}</span>
                        <span className="text-xs text-muted-foreground">{produto.sku}</span>
                      </div>
                    </TableCell>

                    {tamanhosComValor.map((tamanho) => {
                      const planejado = getQuantidadePlanejada(produtoId, tamanho.id)
                      const calculado = planejado * qtdFolhasValidada

                      return (
                        <TableCell key={tamanho.id} className="text-center">
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium tabular-nums">{calculado}</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              {qtdFolhasValidada}×{planejado}
                            </span>
                          </div>
                        </TableCell>
                      )
                    })}

                    <TableCell className="text-center font-semibold text-sm tabular-nums">
                      {getTotalProduto(produtoId)}
                    </TableCell>
                  </TableRow>
                )
              })}

              <TableRow className="bg-muted/30 font-semibold">
                <TableCell className="text-sm">Total</TableCell>
                {tamanhosComValor.map((tamanho) => (
                  <TableCell key={tamanho.id} className="text-center text-sm tabular-nums">
                    {getTotalTamanho(tamanho.id)}
                  </TableCell>
                ))}
                <TableCell className="text-center text-sm tabular-nums">{getTotalGeral()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
