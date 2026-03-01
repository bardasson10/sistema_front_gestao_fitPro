"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PackagePlus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { Enfesto, GradeLote } from "../interface-lote-form"
import { CircleColorView } from "@/components/ui/circle-color-view"
import { GradeTable } from "./grade-table"
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas"
import { UseFormReturn } from "react-hook-form"
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos"
import { AtualizarLoteProducaoPayload } from "@/hooks/queries/useProducao"
import { useProducaoActions } from "@/hooks/use-Producao-actions"
import { Dispatch, SetStateAction } from "react"

interface EnfestoFormProps {
  form: UseFormReturn<LoteProducaoFormValues>
  enfesto: Enfesto
  index: number
  onChange: (index: number, enfesto: Enfesto) => void
  onRemove: (index: number) => void
  canRemove?: boolean
  addItemPart?: boolean
  submittingUpdate: boolean;
  handleSubmitAdicionarItens?: (qtdFolhas: number) => Promise<void>
  limparEnfestos?: () => void
}

export function EnfestoForm({
  form,
  enfesto,
  index,
  onChange,
  onRemove,
  canRemove,
  addItemPart,
  submittingUpdate,
  handleSubmitAdicionarItens,
  limparEnfestos,
}: EnfestoFormProps) {

  const {
    handleEditLote
  } = useProducaoActions();

  const { data: produtosResponse } = useProdutos()
  const { data: tamanhosResponse } = useTamanhos()

  const produtosApi = produtosResponse?.data || []
  const tamanhosApi = Array.isArray(tamanhosResponse) ? tamanhosResponse : []

  const materiaisRaw = form.watch("materiais") || []
  const materiais = Array.isArray(materiaisRaw) ? materiaisRaw : []

  const produtosDaGrade = (enfesto.itens || []).map((item) => ({
    id: item.produtoId,
    label: item.produtoNome,
    sku: item.sku,
  }))

  const produtosDoCatalogo = produtosApi.map((produto) => ({
    id: produto.id,
    label: produto.nome,
    sku: produto.sku,
  }))

  const produtos = Array.from(
    new Map([...produtosDaGrade, ...produtosDoCatalogo].map((produto) => [produto.id, produto])).values()
  )

  const tamanhosDaGrade = (enfesto.itens || []).map((item, itemIndex) => ({
    id: item.tamanhoId,
    label: item.tamanhoNome,
    ordem: itemIndex + 1,
  }))

  const tamanhosDoCatalogo = tamanhosApi.map((tamanho) => ({
    id: tamanho.id,
    label: tamanho.nome,
    ordem: tamanho.ordem,
  }))

  const tamanhos = Array.from(
    new Map([...tamanhosDaGrade, ...tamanhosDoCatalogo].map((tamanho) => [tamanho.id, tamanho])).values()
  ).sort((a, b) => a.ordem - b.ordem)

  const coresDisponiveis = materiais.flatMap((material) => material.cores || [])

  const rolosDisponiveis = coresDisponiveis
    .filter((cor) => !enfesto.corId || cor.id === enfesto.corId)
    .flatMap((cor) => cor.rolos || [])

  function updateField<K extends keyof Enfesto>(field: K, value: Enfesto[K]) {
    onChange(index, { ...enfesto, [field]: value })
  }

  function addRolo() {
    updateField("rolosProducao", [
      ...(enfesto.rolosProducao || []),
      { estoqueRoloId: "", pesoReservado: 0 },
    ])
  }

  function removeRolo(roloIndex: number) {
    updateField(
      "rolosProducao",
      (enfesto.rolosProducao || []).filter((_, i) => i !== roloIndex)
    )
  }

  function updateRolo(roloIndex: number, field: "estoqueRoloId" | "pesoReservado", value: string | number) {
    const updated = (enfesto.rolosProducao || []).map((rolo, i) =>
      i === roloIndex ? { ...rolo, [field]: value } : rolo
    )

    updateField("rolosProducao", updated)
  }

  function handleProdutosChange(produtosSelecionados: string[]) {
    updateField("produtosSelecionados", produtosSelecionados)
  }

  function handleGradeChange(grade: GradeLote[]) {
    updateField("itens", grade)
  }


  // Log para verificar os valores do formulário e do enfesto

  return (
    <Card className="border-muted-foreground/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Enfesto #{index + 1}</CardTitle>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Remover enfesto {index + 1}</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`enfesto-${index}-corId`}>Cor</Label>
            <Select
              value={enfesto.corId}
              onValueChange={(value) => updateField("corId", value)}
            >
              <SelectTrigger id={`enfesto-${index}-corId`} className="w-full" disabled={!addItemPart}>
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                {coresDisponiveis.map((cor) => (
                  <SelectItem key={cor.id} value={cor.id}>
                    <span className="flex items-center gap-2">
                      <CircleColorView height={18} width={18} color={cor.codigoHex} />
                      {cor.nome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`materiais.0.cores.${index}.qtdFolhas`}>Qtd. Folhas</Label>
            <Input
              id={`materiais.0.cores.${index}.qtdFolhas`}
              type="number"
              min={0}
              placeholder="0"
              value={form.watch(`materiais.0.cores.${index}.qtdFolhas`) || 0}
              onChange={(e) => form.setValue(`materiais.0.cores.${index}.qtdFolhas`, Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Rolos de Produção</h4>
            {addItemPart &&
              <Button type="button" variant="outline" size="sm" onClick={addRolo}>
                <Plus className="mr-1 size-3.5" />
                Adicionar Rolo
              </Button>}
          </div>

          {(enfesto.rolosProducao || []).length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2">Nenhum rolo adicionado.</p>
          )}

          {(enfesto.rolosProducao || []).map((rolo, roloIdx) => (
            <div
              key={`${rolo.estoqueRoloId || "rolo"}-${roloIdx}`}
              className="flex items-end gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor={`enfesto-${index}-rolo-${roloIdx}-estoqueRoloId`} className="text-xs">
                  Estoque Rolo
                </Label>
                <Select
                  value={rolo.estoqueRoloId}
                  onValueChange={(value) => updateRolo(roloIdx, "estoqueRoloId", value)}
                >
                  <SelectTrigger id={`enfesto-${index}-rolo-${roloIdx}-estoqueRoloId`} className="h-8 text-sm w-full" disabled={!addItemPart}>
                    <SelectValue placeholder="Selecione o rolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolosDisponiveis.map((estoqueRolo) => (
                      <SelectItem key={estoqueRolo.id} value={estoqueRolo.id}>
                        {estoqueRolo.codigoBarraRolo} {addItemPart && `- ${estoqueRolo.pesoAtualKg} kg`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-36 flex-col gap-2">
                <Label htmlFor={`enfesto-${index}-rolo-${roloIdx}-pesoReservado`} className="text-xs">
                  Peso Reservado (kg)
                </Label>
                <Input
                  id={`enfesto-${index}-rolo-${roloIdx}-pesoReservado`}
                  type="number"
                  min={0}
                  step={0.01}
                  disabled={!addItemPart}
                  placeholder="0"
                  value={rolo.pesoReservado}
                  onChange={(event) => updateRolo(roloIdx, "pesoReservado", Number(event.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              {addItemPart &&
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeRolo(roloIdx)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Remover rolo {roloIdx + 1}</span>
                </Button>}
            </div>
          ))}
        </div>

        <Separator />

        {addItemPart && (
          <div className="flex flex-col gap-3 p-4 border rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Plus className="size-4" /> Adicionar Produtos à Grade
              </Label>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">
                Catálogo Geral
              </span>
            </div>

            <Select
              onValueChange={(value) => {
                if (!enfesto.produtosSelecionados?.includes(value)) {
                  const newSelection = [...(enfesto.produtosSelecionados || []), value]
                  handleProdutosChange(newSelection)
                }
              }}
            >
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Pesquisar produto no catálogo..." />
              </SelectTrigger>
              <SelectContent>
                {produtosApi.map((produto) => (
                  <SelectItem
                    key={produto.id}
                    value={produto.id}
                    disabled={enfesto.produtosSelecionados?.includes(produto.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{produto.nome}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {produto.sku} - {produto.tipo?.nome}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        <GradeTable
          produtosSelecionados={enfesto.produtosSelecionados || []}
          produtos={produtos}
          tamanhos={tamanhos}
          itens={enfesto.itens || []}
          enfestoIndex={index}
          onProdutosChange={handleProdutosChange}
          onGradeChange={handleGradeChange}
        />

        <CardFooter className="flex justify-end p-0">

          {addItemPart ?
            (
              <div className="flex justify-end gap-3 w-full">
                <Button type="button" variant="outline" onClick={limparEnfestos}>
                  <RotateCcw className="mr-1.5 size-4" />
                  Limpar
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmitAdicionarItens?.(form.watch(`materiais.${index}.cores.${index}.qtdFolhas`) || 0)}
                  disabled={submittingUpdate}
                >
                  <PackagePlus className="mr-1.5 size-4" />
                  Adicionar Itens
                </Button>
              </div>
            )
            :
            (
              <Button type="submit" disabled={submittingUpdate}
                onClick={() => handleEditLote(form.getValues("id"),
                  {
                    ...enfesto,
                    qtdFolhas: form.watch(`materiais.${index}.cores.${index}.qtdFolhas`) || 0,
                  })}>
                <Pencil className="mr-1.5 size-4" />
                {submittingUpdate ? "Atualizando..." : "Atualizar Lote"}
              </Button>
            )}


        </CardFooter>

      </CardContent>
    </Card>
  )
}
