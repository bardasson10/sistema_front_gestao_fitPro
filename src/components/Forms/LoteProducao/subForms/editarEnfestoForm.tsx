
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Enfesto, GradeLote, RoloProducao } from "../interface-lote-form";
import { useEffect, useMemo, useState } from "react";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { GradeTable } from "@/components/Forms/LoteProducao/components/grade-table";


interface EnfestoEditarFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submittingUpdate: boolean;
}

type CorConfig = {
  corId: string;
  qtdFolhas: number;
  rolosProducao: RoloProducao[];
};

type CorDisponivel = {
  id: string;
  nome: string;
  codigoHex: string;
  rolosProducao: RoloProducao[];
};

export const EnfestoEditarForm = ({
  form,
  submittingUpdate,
}: EnfestoEditarFormProps) => {

  const {
    handleEditLote,
    isSubmitting,
  } = useProducaoActions();
  const { data: produtosResponse } = useProdutos();
  const { data: tamanhosResponse } = useTamanhos();

  const isLoading = isSubmitting || submittingUpdate

  const [coresSelecionadas, setCoresSelecionadas] = useState<CorConfig[]>([])
  const [gradeItens, setGradeItens] = useState<GradeLote[]>([])
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([])
  const [corParaAdicionar, setCorParaAdicionar] = useState("")
  const loteId = form.watch("id")

  const materiais = form.watch("materiais") || []
  const produtosApi = produtosResponse?.data || []
  const tamanhosApi = Array.isArray(tamanhosResponse) ? tamanhosResponse : []

  const coresDisponiveis = useMemo<CorDisponivel[]>(() => {
    const allCores = materiais.flatMap((material) => material.cores || [])
    const byId = new Map<string, CorDisponivel>()

    allCores.forEach((cor) => {
      if (!cor.id || byId.has(cor.id)) {
        return
      }

      byId.set(cor.id, {
        id: cor.id,
        nome: cor.nome,
        codigoHex: cor.codigoHex,
        rolosProducao: (cor.rolos || []).map((rolo) => ({
          estoqueRoloId: rolo.id,
          pesoReservado: Number(rolo.pesoReservado || 0),
        })),
      })
    })

    return Array.from(byId.values())
  }, [materiais])

  const corById = useMemo(() => {
    return new Map(coresDisponiveis.map((cor) => [cor.id, cor]))
  }, [coresDisponiveis])

  const produtosDaGrade = useMemo(() => {
    return gradeItens.map((item) => ({
      id: item.produtoId,
      label: item.produtoNome,
      sku: item.sku,
    }))
  }, [gradeItens])

  const produtosDoCatalogo = useMemo(() => {
    return produtosApi.map((produto) => ({
      id: produto.id,
      label: produto.nome,
      sku: produto.sku,
    }))
  }, [produtosApi])

  const produtos = useMemo(() => {
    return Array.from(
      new Map([...produtosDaGrade, ...produtosDoCatalogo].map((produto) => [produto.id, produto])).values()
    )
  }, [produtosDaGrade, produtosDoCatalogo])

  const tamanhos = useMemo(() => {
    const tamanhosDoCatalogoPorId = new Map(
      tamanhosApi.map((tamanho) => [tamanho.id, tamanho])
    )

    const tamanhosDaGrade = gradeItens.map((item) => ({
      id: item.tamanhoId,
      label: item.tamanhoNome,
      ordem: tamanhosDoCatalogoPorId.get(item.tamanhoId)?.ordem ?? Number.MAX_SAFE_INTEGER,
    }))

    const tamanhosDoCatalogo = tamanhosApi.map((tamanho) => ({
      id: tamanho.id,
      label: tamanho.nome,
      ordem: tamanho.ordem,
    }))

    return Array.from(
      new Map([...tamanhosDaGrade, ...tamanhosDoCatalogo].map((tamanho) => [tamanho.id, tamanho])).values()
    ).sort((a, b) => a.ordem - b.ordem)
  }, [gradeItens, tamanhosApi])

  const coresDisponiveisParaAdicionar = coresDisponiveis.filter(
    (cor) => !coresSelecionadas.some((selecionada) => selecionada.corId === cor.id)
  )

  const produtosDisponiveisParaAdicionar = produtosApi.filter(
    (produto) => !produtosSelecionados.includes(produto.id)
  )

  const qtdFolhasReferencia = coresSelecionadas[0]?.qtdFolhas || 0

  useEffect(() => {
    if (!loteId) {
      setCoresSelecionadas([])
      setGradeItens([])
      setProdutosSelecionados([])
      return
    }

    const enfestos = (form.getValues("materiais") || []).flatMap((material) =>
      (material.cores || []).map<Enfesto>((cor) => {
        const qtdFolhas = Number(cor.qtdFolhas || 0)

        return {
          corId: cor.id,
          qtdFolhas,
          rolosProducao: (cor.rolos || []).map((rolo) => ({
            estoqueRoloId: rolo.id,
            pesoReservado: Number(rolo.pesoReservado || 0),
          })),
          produtosSelecionados: Array.from(new Set((cor.gradeLote || []).map((grade) => grade.produtoId))),
          itens: (cor.gradeLote || []).map((grade) => {
            const quantidadePlanejada = Number(grade.quantidadePlanejada || 0)
            const qtdMultiplicadorGrade = Number(
              grade.qtdMultiplicadorGrade ?? (qtdFolhas > 0 ? quantidadePlanejada / qtdFolhas : 0),
            )

            return {
              id: grade.id,
              produtoId: grade.produtoId,
              tamanhoId: grade.tamanhoId,
              qtdMultiplicadorGrade,
              quantidadePlanejada,
              produtoNome: grade.produtoNome,
              sku: grade.sku,
              tamanhoNome: grade.tamanhoNome,
            }
          }),
        }
      }),
    )

    const coresIniciais = enfestos.map((enfesto) => ({
      corId: enfesto.corId,
      qtdFolhas: enfesto.qtdFolhas,
      rolosProducao: enfesto.rolosProducao,
    }))

    const enfestoBase = enfestos.find((enfesto) => enfesto.itens.length > 0) || enfestos[0]

    setCoresSelecionadas(coresIniciais)
    setGradeItens(enfestoBase?.itens || [])
    setProdutosSelecionados(enfestoBase?.produtosSelecionados || [])
  }, [loteId])

  function addCor(corId: string) {
    const corInfo = corById.get(corId)
    if (!corInfo) {
      return
    }

    setCoresSelecionadas((prev) => {
      if (prev.some((cor) => cor.corId === corId)) {
        return prev
      }

      return [...prev, {
        corId,
        qtdFolhas: 0,
        rolosProducao: corInfo.rolosProducao,
      }]
    })

    setCorParaAdicionar("")
  }

  function removeCor(corId: string) {
    setCoresSelecionadas((prev) => prev.filter((cor) => cor.corId !== corId))
  }

  function updateQtdFolhasCor(corId: string, value: number) {
    setCoresSelecionadas((prev) =>
      prev.map((cor) => cor.corId === corId ? { ...cor, qtdFolhas: Math.max(0, value) } : cor)
    )
  }

  function handleRemoveProduto(produtoId: string) {
    setProdutosSelecionados((prev) => prev.filter((id) => id !== produtoId))
    setGradeItens((prev) => prev.filter((item) => item.produtoId !== produtoId))
  }

  async function handleSubmitAtualizarLote() {
    const idLote = form.getValues("id")

    if (!idLote) {
      toast.error("ID do lote não encontrado para atualizar.")
      return
    }

    if (coresSelecionadas.length === 0) {
      toast.error("Selecione ao menos uma cor para atualizar.")
      return
    }

    if (!gradeItens || gradeItens.length === 0) {
      toast.error("A grade deve ter ao menos um item.")
      return
    }

    for (const cor of coresSelecionadas) {
      if (!cor.corId) {
        toast.error("Todas as cores devem estar preenchidas.")
        return
      }

      if (!cor.qtdFolhas || cor.qtdFolhas <= 0) {
        toast.error("Todas as cores devem ter quantidade de folhas maior que 0.")
        return
      }
    }

    await handleEditLote(idLote, {
      gradeItens: gradeItens.map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        qtdMultiplicadorGrade: Number(item.qtdMultiplicadorGrade || 0),
      })),
      enfestos: coresSelecionadas.map((cor) => ({
        corId: cor.corId,
        qtdFolhas: cor.qtdFolhas,
        rolosProducao: cor.rolosProducao,
      })),
    })
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Enfestos</CardTitle>
        <CardDescription>
          Defina uma grade unica e distribua por cor alterando apenas a quantidade de folhas.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="space-y-4 rounded-lg border p-4">
          {coresSelecionadas.length === 0 && coresDisponiveisParaAdicionar.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label>Cor</Label>
                <Select value={corParaAdicionar} onValueChange={setCorParaAdicionar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {coresDisponiveisParaAdicionar.map((cor) => (
                      <SelectItem key={cor.id} value={cor.id}>
                        <span className="flex items-center gap-2">
                          <CircleColorView height={16} width={16} color={cor.codigoHex} />
                          {cor.nome}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => addCor(corParaAdicionar)}
                disabled={!corParaAdicionar}
              >
                <Plus className="mr-1.5 size-4" />
                Adicionar Cor
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {coresSelecionadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma cor selecionada.</p>
            ) : (
              coresSelecionadas.map((cor) => {
                const corInfo = corById.get(cor.corId)

                return (
                  <div key={cor.corId} className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                    <div className="h-12 flex items-center gap-2 text-sm font-medium">
                      <CircleColorView height={16} width={16} color={corInfo?.codigoHex} />
                      <span>{corInfo?.nome || cor.corId}</span>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`qtd-folhas-${cor.corId}`}>Qtd. Folhas</Label>
                      <Input
                        id={`qtd-folhas-${cor.corId}`}
                        type="number"
                        min={0}
                        value={cor.qtdFolhas || 0}
                        onChange={(e) => updateQtdFolhasCor(cor.corId, Number(e.target.value) || 0)}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCor(cor.corId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Plus className="size-4" />
              Adicionar Produtos a Grade
            </Label>

            <Select
              onValueChange={(value) => {
                if (!produtosSelecionados.includes(value)) {
                  setProdutosSelecionados((prev) => [...prev, value])
                }
              }}
            >
              <SelectTrigger className="h-10 bg-background">
                <SelectValue placeholder="Pesquisar produto no catalogo..." />
              </SelectTrigger>
              <SelectContent>
                {produtosDisponiveisParaAdicionar.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id}>
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

          <GradeTable
            produtosSelecionados={produtosSelecionados}
            produtos={produtos}
            tamanhos={tamanhos}
            itens={gradeItens}
            enfestoIndex={0}
            qtdFolhas={qtdFolhasReferencia}
            onProdutosChange={setProdutosSelecionados}
            onGradeChange={setGradeItens}
            onRemoveProduto={handleRemoveProduto}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button type="button" onClick={handleSubmitAtualizarLote} disabled={isLoading}>
          <Pencil className="mr-1.5 size-4" />
          {isLoading ? <Spinner /> : "Atualizar Lote"}
        </Button>
      </CardFooter>
    </Card>
  )
};