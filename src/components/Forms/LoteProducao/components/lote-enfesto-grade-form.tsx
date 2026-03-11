
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddItemEnfestoForm } from "../subForms/addItemEnfestoForm"
import { EnfestoEditarForm } from "../subForms/editarEnfestoForm"
import { PackagePlus, Pencil, Table2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";




interface LoteEnfestoGradeFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  submitting: boolean;
}


export function LoteEnfestoGradeForm({ form, submitting }: LoteEnfestoGradeFormProps) {
  const [activeTab, setActiveTab] = React.useState("editar");
  const materiais = form.watch("materiais") || []

  const coresDoLote = React.useMemo(() => {
    return materiais.flatMap((material) => material.cores || [])
  }, [materiais])

  const hasGrade = React.useMemo(() => {
    return coresDoLote.flatMap((cor) => cor.gradeLote || []).length > 0
  }, [coresDoLote])

  const todasCoresComGrade = React.useMemo(() => {
    if (!coresDoLote.length) return false
    return coresDoLote.every((cor) => (cor.gradeLote || []).length > 0)
  }, [coresDoLote])

  const podeAdicionarItens = !todasCoresComGrade

  React.useEffect(() => {
    if (!podeAdicionarItens && activeTab === "adicionar") {
      setActiveTab("editar")
      return
    }

    if (podeAdicionarItens && !hasGrade && activeTab === "editar") {
      setActiveTab("adicionar")
    }
  }, [hasGrade, activeTab, podeAdicionarItens])


  return (
    <div className="flex flex-col gap-6">

      {/* Tabs: Editar vs Adicionar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${podeAdicionarItens ? "grid-cols-3" : "grid-cols-2"}`}>
          <TabsTrigger value="editar" className="flex items-center gap-2">
            <Pencil className="size-4" />
            Editar Grade Existente
          </TabsTrigger>
          {podeAdicionarItens && (
            <TabsTrigger value="adicionar" className="flex items-center gap-2">
              <PackagePlus className="size-4" />
              Adicionar Novos Itens
            </TabsTrigger>
          )}
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

        {/* Tab: Adicionar Novos Itens (POST) */}
        {podeAdicionarItens && (
          <TabsContent value="adicionar" className="flex flex-col gap-6 mt-6">
            <AddItemEnfestoForm form={form} submittingAdd={submitting}  />
          </TabsContent>
        )}

      </Tabs>
    </div>
  )
}
