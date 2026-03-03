
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoteEnfestoGradeForm } from "./components/lote-enfesto-grade-form";
import { DadosLoteForm } from "./AddFormSteps/dadosLoteForm";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { UseFormReturn } from "react-hook-form";
import { Colaborador } from "@/types/production";
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, PackagePlus, Package } from "lucide-react";
import { LoteProducaoFormInfo } from "./AddFormSteps/loteProducao-info-form";



interface LoteProducaoAccordionFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  lote: ApiLoteProducaoResponse
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  handleEditLoteCabeçalho: (id: string, values: ApiLoteProducaoResponse) => Promise<void>
  submitting: boolean;
}

export const LoteProducaoAccordionForm = ({
  form,
  lote,
  colaboradoresResponse,
  handleEditLoteCabeçalho,
  submitting,
}: LoteProducaoAccordionFormProps) => {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <Accordion type="multiple" defaultValue={[]} className="w-full border rounded-md px-4">
        <AccordionItem value="dados">
          <AccordionTrigger>1. Dados do Lote</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6">

              {/* Tabs: Editar vs Adicionar */}
              <Tabs defaultValue="editar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editar" className="flex items-center gap-2">
                    <Pencil className="size-4" />
                    Editar Cabeçalho Lote
                  </TabsTrigger>
                  <TabsTrigger value="informacao" className="flex items-center gap-2">
                    <Package className="size-4" />
                    Informações do Lote
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Editar Grade Existente (PUT) */}
                <TabsContent value="editar" className="flex flex-col gap-6 mt-6">
                  <DadosLoteForm form={form} colaboradoresResponse={colaboradoresResponse} handleEditLoteCabeçalho={handleEditLoteCabeçalho} />
                </TabsContent>

                {/* Tab: Adicionar Novos Itens (POST) */}
                <TabsContent value="informacao" className="flex flex-col gap-6 mt-6">
                  <LoteProducaoFormInfo lote={lote} />
                </TabsContent>
              </Tabs>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tecidos">
          <AccordionTrigger>2. Rolos de Tecido</AccordionTrigger>
          <AccordionContent>
            <LoteEnfestoGradeForm form={form} submitting={submitting} />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};
