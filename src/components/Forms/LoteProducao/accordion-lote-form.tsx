
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoteEnfestoGradeForm } from "./components/lote-enfesto-grade-form";
import { DadosLoteForm } from "./subForms/dadosLoteForm";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { UseFormReturn } from "react-hook-form";
import { Colaborador } from "@/types/production";
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";
import { ILoteResponse, IRequestBodyUpdateLote } from "@/types/Lote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Package, Shirt, CirclePile } from "lucide-react";
import { LoteProducaoFormInfo } from "./subForms/loteProducao-info-form";
import { DadosTecido } from "./subForms/dadosTecido";



interface LoteProducaoAccordionFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  lote: ILoteResponse
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  handleEditLoteCabeçalho: (id: string, values: IRequestBodyUpdateLote) => Promise<void>
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

              <DadosLoteForm form={form} lote={lote} colaboradoresResponse={colaboradoresResponse} handleEditLoteCabeçalho={handleEditLoteCabeçalho} />
              {/* Tabs: Editar vs Adicionar */}

            </div>
          </AccordionContent>
        </AccordionItem>


        <AccordionItem value="tecidos">
          <AccordionTrigger>2. Tecidos</AccordionTrigger>
          <AccordionContent>

            <Tabs defaultValue="editar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editar" className="flex items-center gap-2">
                  <CirclePile className="size-4" />
                  Tecidos do Lote
                </TabsTrigger>
                <TabsTrigger value="informacao" className="flex items-center gap-2">
                  <Shirt className="size-4" />
                  Informações dos Tecidos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editar" className="flex flex-col gap-6 mt-6">
                <DadosTecido form={form} lote={lote} />
              </TabsContent>

              <TabsContent value="informacao" className="flex flex-col gap-6 mt-6">
                <LoteProducaoFormInfo lote={lote} />
              </TabsContent>

            </Tabs>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="enfesto">
          <AccordionTrigger>3. Enfesto</AccordionTrigger>
          <AccordionContent>
            <LoteEnfestoGradeForm form={form} submitting={submitting} />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};
