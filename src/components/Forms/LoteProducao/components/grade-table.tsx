"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { GradeLote } from "../interface-lote-form"


interface GradeTableProps {
  produtosSelecionados: string[]
  itens: GradeLote[]
  tamanhos: { id: string; label: string; ordem: number }[]
  produtos: { id: string; label: string; sku: string }[]
  enfestoIndex: number
  qtdFolhas: number
  onProdutosChange: (produtos: string[]) => void
  onGradeChange: (grade: GradeLote[]) => void
  onRemoveProduto: (produtoId: string) => void
}

export function GradeTable({
  produtosSelecionados,
  itens,

  tamanhos: TAMANHOS,
  produtos: PRODUTOS,
  qtdFolhas,
  onProdutosChange,
  onGradeChange,
  onRemoveProduto,
}: GradeTableProps) {

  const produtosUnicos = Array.from(
    new Map(PRODUTOS.map((produto) => [produto.id, produto])).values()
  )

  const produtosSelecionadosUnicos = Array.from(new Set(produtosSelecionados))

  const tamanhosOrdenados = Array.from(
    new Map(TAMANHOS.map((tamanho) => [tamanho.id, tamanho])).values()
  ).sort((a, b) => a.ordem - b.ordem)

  function addProduto(produtoId: string) {
    if (!produtoId || produtosSelecionadosUnicos.includes(produtoId)) return
    onProdutosChange([...produtosSelecionadosUnicos, produtoId])
  }

  function updateQtdMultiplicador(produtoId: string, tamanhoId: string, value: number) {
    const qtdFolhasValidada = Math.max(0, Number(qtdFolhas) || 0)
    const quantidadePlanejada = value * qtdFolhasValidada

    const existing = itens.find((grade) => grade.produtoId === produtoId && grade.tamanhoId === tamanhoId)

    if (existing) {
      onGradeChange(
        itens.map((grade) =>
          grade.produtoId === produtoId && grade.tamanhoId === tamanhoId
            ? {
              ...grade,
              qtdMultiplicadorGrade: value,
              quantidadePlanejada,
            }
            : grade
        )
      )
      return
    }

    const produto = produtosUnicos.find((item) => item.id === produtoId)
    const tamanho = tamanhosOrdenados.find((item) => item.id === tamanhoId)

    const novoItem: GradeLote = {
      id: crypto.randomUUID(),
      produtoId,
      tamanhoId,
      qtdMultiplicadorGrade: value,
      quantidadePlanejada,
      produtoNome: produto?.label || "",
      sku: produto?.sku || "",
      tamanhoNome: tamanho?.label || "",
    }

    onGradeChange([...itens, novoItem])
  }

  function getQtdMultiplicador(produtoId: string, tamanhoId: string): number {
    const grade = itens.find(g => g.produtoId === produtoId && g.tamanhoId === tamanhoId)
    return grade ? grade.qtdMultiplicadorGrade : 0
  }

  function getTotalProduto(produtoId: string): number {
    return tamanhosOrdenados.reduce(
      (sum, t) => sum + getQtdMultiplicador(produtoId, t.id),
      0
    )
  }

  function getTotalTamanho(tamanhoId: string): number {
    return produtosSelecionadosUnicos.reduce(
      (sum, pId) => sum + getQtdMultiplicador(pId, tamanhoId),
      0
    )
  }

  function getTotalGeral(): number {
    return itens.reduce((sum, g) => sum + g.qtdMultiplicadorGrade, 0)
  }


  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          Grade de Multiplicadores
        </h4>
      
      </div>

      {produtosSelecionadosUnicos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-2">
          Nenhum produto adicionado a grade. Selecione um produto acima.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-40 font-semibold">
                  Produto
                </TableHead>
                {tamanhosOrdenados.map((t, index) => (
                  <TableHead key={`${t.id || 'tamanho'}-${index}`} className="text-center min-w-18 font-semibold">
                    {t.label}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-18 font-semibold">
                  Total
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosSelecionadosUnicos.flatMap((produtoId) => {
                const produto = produtosUnicos.find((p) => p.id === produtoId)
                if (!produto) return null
                return (
                  <TableRow key={produtoId}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">{produto.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {produto.sku}
                        </span>
                      </div>
                    </TableCell>
                    {tamanhosOrdenados.map((t, index) => (
                      <TableCell key={`${t.id || 'tamanho'}-${index}`} className="p-1.5">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-full text-center text-sm"
                          value={getQtdMultiplicador(produtoId, t.id) || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateQtdMultiplicador(
                              produtoId,
                              t.id,
                              Number(e.target.value) || 0
                            )
                          }
                          aria-label={`${produto.label} - ${t.label}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold text-sm tabular-nums">
                      {getTotalProduto(produtoId)}
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveProduto(produtoId)}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">
                          Remover {produto.label}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}

              {/* Linha de totais */}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell className="text-sm">Total</TableCell>
                {tamanhosOrdenados.map((t, index) => (
                  <TableCell key={`${t.id || 'tamanho'}-${index}`} className="text-center text-sm tabular-nums">
                    {getTotalTamanho(t.id)}
                  </TableCell>
                ))}
                <TableCell className="text-center text-sm tabular-nums">
                  {getTotalGeral()}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
