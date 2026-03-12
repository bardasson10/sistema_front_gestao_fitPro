
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnfestoEditarForm } from "../subForms/editarEnfestoForm"
import { Pencil, Table2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { GradeTotalPorCorTabs } from "./grade-total-por-cor-tabs";




interface LoteEnfestoGradeFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submitting: boolean;
}


export function LoteEnfestoGradeForm({ form, submitting }: LoteEnfestoGradeFormProps) {
  const [activeTab, setActiveTab] = React.useState("editar");


  return (
    <div className="flex flex-col gap-6">

      {/* Tabs: Editar e Resumo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editar" className="flex items-center gap-2">
            <Pencil className="size-4" />
            Editar Grade Existente
          </TabsTrigger>
          <TabsTrigger value="resumo" className="flex items-center gap-2">
            <Table2 className="size-4" />
            Resumo Por Cor
          </TabsTrigger>
        </TabsList>

        {/* Tab: Editar Grade Existente (PUT) */}
        <TabsContent value="editar" className="flex flex-col gap-6 mt-6">
          <EnfestoEditarForm
            form={form}
            submittingUpdate={submitting}
          />
        </TabsContent>

        <TabsContent value="resumo" className="flex flex-col gap-6 mt-6">
          <GradeTotalPorCorTabs form={form} />
        </TabsContent>

      </Tabs>
    </div>
  )
}
