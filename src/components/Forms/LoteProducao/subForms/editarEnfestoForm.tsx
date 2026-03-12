
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EnfestoForm } from "@/components/Forms/LoteProducao/components/enfesto-form";
import { UseFormReturn } from "react-hook-form";
import { Enfesto } from "../interface-lote-form";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";


interface EnfestoEditarFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submittingUpdate: boolean;
}

export const EnfestoEditarForm = ({
  form,
  submittingUpdate,
}: EnfestoEditarFormProps) => {

  const {
    handleEditLote,
    isSubmitting,
  } = useProducaoActions();

  const isLoading = isSubmitting || submittingUpdate



  const [enfestosNewItens, setEnfestosNewItens] = useState<Enfesto[]>([])
  const loteId = form.watch("id")

  const mapFormToEnfestos = () => {
    return (form.getValues("materiais") || []).flatMap((m) =>
      (m.cores || []).map<Enfesto>((c) => {
        const qtdFolhas = Number(c.qtdFolhas || 0)

        return {
          corId: c.id,
          qtdFolhas,
          rolosProducao: (c.rolos || []).map((r) => ({ estoqueRoloId: r.id, pesoReservado: r.pesoReservado })),
          produtosSelecionados: Array.from(new Set((c.gradeLote || []).map((g) => g.produtoId))),
          itens: (c.gradeLote || []).map((g) => {
            const quantidadePlanejada = Number(g.quantidadePlanejada || 0)
            const qtdMultiplicadorGrade = Number(
              g.qtdMultiplicadorGrade ?? (qtdFolhas > 0 ? quantidadePlanejada / qtdFolhas : 0),
            )

            return {
              id: g.id,
              produtoId: g.produtoId,
              tamanhoId: g.tamanhoId,
              qtdMultiplicadorGrade,
              quantidadePlanejada,
              produtoNome: g.produtoNome,
              sku: g.sku,
              tamanhoNome: g.tamanhoNome,
            }
          }),
        }
      }),
    )
  }

  useEffect(() => {
    if (!loteId) {
      setEnfestosNewItens([])
      return
    }

    setEnfestosNewItens(mapFormToEnfestos())
  }, [loteId])


  function handleEnfestoChange(index: number, updatedEnfesto: Enfesto) {
    const updatedEnfestos = enfestosNewItens.map((e, i) => i === index ? updatedEnfesto : e)
    setEnfestosNewItens(updatedEnfestos)
  }

  function handleEnfestoRemove(index: number) {
    const updatedEnfestos = enfestosNewItens.filter((_, i) => i !== index)
    setEnfestosNewItens(updatedEnfestos)
  }

  async function handleSubmitAtualizarLote() {
    const idLote = form.getValues("id")

    if (!idLote) {
      toast.error("ID do lote nao encontrado para atualizar.")
      return
    }

    if (enfestosNewItens.length === 0) {
      toast.error("Nao ha enfestos para atualizar.")
      return
    }

    for (const enfesto of enfestosNewItens) {
      if (!enfesto.corId) {
        toast.error("Todos os enfestos devem ter uma cor selecionada.")
        return
      }

      if (!enfesto.qtdFolhas || enfesto.qtdFolhas <= 0) {
        toast.error("Todos os enfestos devem ter quantidade de folhas maior que 0.")
        return
      }

      if (!enfesto.itens || enfesto.itens.length === 0) {
        toast.error("Todos os enfestos devem ter ao menos um item na grade.")
        return
      }
    }

    await handleEditLote(idLote, {
      enfestos: enfestosNewItens.map((enfesto) => ({
        corId: enfesto.corId,
        qtdFolhas: enfesto.qtdFolhas,
        rolosProducao: enfesto.rolosProducao,
        itens: enfesto.itens,
      })),
    })
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Enfestos</CardTitle>
        <CardDescription>
          Edite os enfestos, rolos e a grade de tamanhos existentes.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="w-full flex flex-col gap-4">
          <Carousel className="w-full">
            <CarouselContent>
              {enfestosNewItens.map((enfesto, index) => (
                <CarouselItem key={`${enfesto.corId || 'enfesto'}-${index}`}>
                  <EnfestoForm
                    index={index}
                    onRemove={handleEnfestoRemove}
                    onChange={handleEnfestoChange}
                    enfesto={enfesto}
                    form={form}
                    canRemove={enfestosNewItens.length > 1}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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