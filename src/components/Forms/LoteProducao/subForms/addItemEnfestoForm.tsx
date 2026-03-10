"use client"

import { useMemo, useState } from "react"
import { useFormContext, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Plus, RotateCcw, PackagePlus } from "lucide-react"

import { CircleColorView } from "@/components/ui/circle-color-view"
import { EnfestoForm } from "@/components/Forms/LoteProducao/components/enfesto-form"

import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas"
import { Enfesto } from "@/components/Forms/LoteProducao/interface-lote-form"
import { useProducaoActions } from "@/hooks/use-Producao-actions"
import { toast } from "sonner"

function createFreshEnfesto(): Enfesto {
  return {
    corId: "",
    qtdFolhas: 0,
    rolosProducao: [{ estoqueRoloId: "", pesoReservado: 0 }],
    produtosSelecionados: [],
    itens: [],
  }
}

interface AddItemEnfestoFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submittingAdd: boolean;
}


export const AddItemEnfestoForm = ({
  form,
  submittingAdd,
}: AddItemEnfestoFormProps) => {

  const {
    handleAdicionarItens
  } = useProducaoActions();

  const [enfestosNewItens, setEnfestosNewItens] = useState<Enfesto[]>([{
    corId: "",
    qtdFolhas: 0,
    rolosProducao: [{ estoqueRoloId: "", pesoReservado: 0 }],
    produtosSelecionados: [],
    itens: [],
  }])


  function handleEnfestoChange(index: number, updatedEnfesto: Enfesto) {
    setEnfestosNewItens((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? updatedEnfesto : item
    )))
  }

  function handleEnfestoRemove(index: number) {
    setEnfestosNewItens(prev => prev.filter((_, i) => i !== index))
  }

  function addEnfesto() {
    setEnfestosNewItens([...enfestosNewItens, createFreshEnfesto()])
  }

  function limparEnfestos() {
    setEnfestosNewItens([])
  }

  async function handleSubmitAdicionarItens(qtdFolhas: number) {
    const loteId = form.getValues("id")

    if (!loteId) {
      toast.error("ID do lote não encontrado para adicionar itens.")
      return
    }

    if (enfestosNewItens.length === 0) {
      toast.error("Adicione ao menos um enfesto antes de salvar.")
      return
    }

    // Validar cada enfesto antes de enviar
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

    const payload = enfestosNewItens.map((enfesto) => ({
      corId: enfesto.corId,
      qtdFolhas: enfesto.qtdFolhas,  // Usar qtdFolhas do próprio enfesto
      rolosProducao: (enfesto.rolosProducao || []).map((rolo) => ({
        estoqueRoloId: rolo.estoqueRoloId,
      })),
      itens: (enfesto.itens || []).map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        quantidadePlanejada: item.quantidadePlanejada,
      })),
    }))

    await handleAdicionarItens(loteId, payload)
  }

  return (
    <Card >
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Novos Itens</CardTitle>
          <Badge variant="secondary" className="border-primary text-primary">

          </Badge>
        </div>
        <CardDescription>
          Adicione novos enfestos ao lote selecionado.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
      

        <Button type="button" onClick={addEnfesto} className="w-full">
          <Plus className="mr-1.5 size-4" />
          Novo Enfesto
        </Button>
        <div className=" w-full  flex flex-col gap-4 ">
          <Carousel className="w-full ">
            <CarouselContent >
              {enfestosNewItens.map((enfesto, index) => (
                <CarouselItem key={`${enfesto.corId || 'enfesto'}-${index}`}>
                  <EnfestoForm
                    index={index}
                    onRemove={handleEnfestoRemove}
                    onChange={handleEnfestoChange}
                    enfesto={enfesto}
                    form={form}
                    canRemove={enfestosNewItens.length > 1}
                    addItemPart={true}
                    submittingUpdate={submittingAdd}
                    handleSubmitAdicionarItens={handleSubmitAdicionarItens}
                    limparEnfestos={limparEnfestos}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-11" />
            <CarouselNext className="mr-11" />
          </Carousel>
        </div>

        <Separator />

      </CardContent>
    </Card>
  )
}