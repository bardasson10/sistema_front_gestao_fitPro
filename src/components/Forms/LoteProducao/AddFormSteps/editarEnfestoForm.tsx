
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { EnfestoForm } from "@/components/Forms/LoteProducao/components/enfesto-form";
import { UseFormReturn } from "react-hook-form";
import { Enfesto } from "../interface-lote-form";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useProducaoActions } from "@/hooks/use-Producao-actions";

function createFreshEnfesto(): Enfesto {
  return {
    corId: "",
    qtdFolhas: 0,
    rolosProducao: [{ estoqueRoloId: "", pesoReservado: 0 }],
    produtosSelecionados: [],
    itens: [],
  }
}


interface EnfestoEditarFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submittingUpdate: boolean;
}

export const EnfestoEditarForm = ({
  form,
  submittingUpdate,
}: EnfestoEditarFormProps) => {



  const [enfestosNewItens, setEnfestosNewItens] = useState<Enfesto[]>([])
  const loteId = form.watch("id")

  const mapFormToEnfestos = () => {
    return (form.getValues("materiais") || []).flatMap((m) => (m.cores || []).map<Enfesto>((c) => ({
      corId: c.id,
      qtdFolhas: c.qtdFolhas || 0,
      rolosProducao: (c.rolos || []).map((r) => ({ estoqueRoloId: r.id, pesoReservado: r.pesoReservado })),
      produtosSelecionados: Array.from(new Set((c.gradeLote || []).map((g) => g.produtoId))),
      itens: (c.gradeLote || []).map((g) => ({
        id: g.id,
        produtoId: g.produtoId,
        tamanhoId: g.tamanhoId,
        quantidadePlanejada: g.quantidadePlanejada,
        produtoNome: g.produtoNome,
        sku: g.sku,
        tamanhoNome: g.tamanhoNome,
      })),
    })))
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


  return (
    <div className="flex flex-col gap-6">

      {/* Enfestos Existentes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Enfestos</h2>
            <p className="text-sm text-muted-foreground">
              Edite os enfestos, rolos e a grade de tamanhos existentes.
            </p>
          </div>
        </div>

        <div className=" w-full  flex flex-col gap-4">
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
                    submittingUpdate={submittingUpdate}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>


 

    </div>
  )
};