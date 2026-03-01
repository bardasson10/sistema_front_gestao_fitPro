
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoteEnfestoGradeForm } from "./components/lote-enfesto-grade-form";
import { DadosLoteForm } from "./AddFormSteps/dadosLoteForm";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { UseFormReturn } from "react-hook-form";
import { Colaborador } from "@/types/production";
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { is } from "zod/v4/locales";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";


interface LoteProducaoAccordionFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  handleEditLoteCabeçalho: (id: string, values: ApiLoteProducaoResponse) => Promise<void>
  submitting: boolean;
}

export const LoteProducaoAccordionForm = ({
  form,
  colaboradoresResponse,
  handleEditLoteCabeçalho,
  submitting,
}: LoteProducaoAccordionFormProps) => {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <Accordion type="multiple" defaultValue={["dados", "tecidos"]} className="w-full border rounded-md px-4">
        <AccordionItem value="dados">
          <AccordionTrigger>1. Dados do Lote</AccordionTrigger>
          <AccordionContent>
            <DadosLoteForm form={form} colaboradoresResponse={colaboradoresResponse} handleEditLoteCabeçalho={handleEditLoteCabeçalho} />
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
