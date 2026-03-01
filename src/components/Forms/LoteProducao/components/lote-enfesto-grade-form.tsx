
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DadosLoteForm } from "../AddFormSteps/dadosLoteForm"
import { AddItemEnfestoForm } from "../AddFormSteps/addItemEnfestoForm"
import { EnfestoEditarForm } from "../AddFormSteps/editarEnfestoForm"
import { PackagePlus, Pencil } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";



interface LoteEnfestoGradeFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submitting: boolean;
}


export function LoteEnfestoGradeForm({ form, submitting }: LoteEnfestoGradeFormProps) {


  return (
    <div className="flex flex-col gap-6">

      {/* Tabs: Editar vs Adicionar */}
      <Tabs defaultValue="editar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editar" className="flex items-center gap-2">
            <Pencil className="size-4" />
            Editar Grade Existente
          </TabsTrigger>
          <TabsTrigger value="adicionar" className="flex items-center gap-2">
            <PackagePlus className="size-4" />
            Adicionar Novos Itens
          </TabsTrigger>
        </TabsList>

        {/* Tab: Editar Grade Existente (PUT) */}
        <TabsContent value="editar" className="flex flex-col gap-6 mt-6">
          <EnfestoEditarForm
            form={form}
            submittingUpdate={submitting}
          />
        </TabsContent>

        {/* Tab: Adicionar Novos Itens (POST) */}
        <TabsContent value="adicionar" className="flex flex-col gap-6 mt-6">
          <AddItemEnfestoForm form={form} submittingAdd={submitting}  />
        </TabsContent>
      </Tabs>
    </div>
  )
}
