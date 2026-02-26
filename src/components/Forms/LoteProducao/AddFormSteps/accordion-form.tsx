import { LoteProducaoAddStep1 } from "@/components/Forms/LoteProducao/AddFormSteps/step-1";
import { LoteProducaoAddStep2 } from "@/components/Forms/LoteProducao/AddFormSteps/step-2";
import { LoteProducaoAddStep3 } from "@/components/Forms/LoteProducao/AddFormSteps/step-3";
import { LoteProducaoAddStep4 } from "@/components/Forms/LoteProducao/AddFormSteps/step-4";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGradeEdicao } from "@/hooks/use-grade-edicao";

interface Props {
  isEditing?: boolean;
  gradeEdicao: ReturnType<typeof useGradeEdicao>;
  handleAdicionarItens: () => void;
}

export const LoteProducaoAccordionForm = ({
  isEditing = false,
  gradeEdicao,
  handleAdicionarItens,
}: Props) => {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <Accordion type="multiple" defaultValue={["dados", "tecidos", "enfestos", "grades"]} className="w-full border rounded-md px-4">
        <AccordionItem value="dados">
          <AccordionTrigger>1. Dados do Lote</AccordionTrigger>
          <AccordionContent>
            <LoteProducaoAddStep1 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tecidos">
          <AccordionTrigger>2. Rolos de Tecido</AccordionTrigger>
          <AccordionContent>
            <LoteProducaoAddStep2 isEditing={isEditing} />
          </AccordionContent>
        </AccordionItem>

        {isEditing &&
          <>
            <AccordionItem value="enfestos">
              <AccordionTrigger>3. Enfestos</AccordionTrigger>
              <AccordionContent>
                <LoteProducaoAddStep3 />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="grades">
              <AccordionTrigger>4. Produtos e Grades</AccordionTrigger>
              <AccordionContent>
                <LoteProducaoAddStep4
                  isEditing={isEditing}
                  gradeEdicao={gradeEdicao}
                  handleAdicionarItens={handleAdicionarItens}
                />
              </AccordionContent>
            </AccordionItem>
          </>
        }
      </Accordion>
    </div>
  );
};
