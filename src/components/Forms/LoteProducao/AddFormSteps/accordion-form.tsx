import { LoteProducaoAddStep1 } from "@/components/Forms/LoteProducao/AddFormSteps/step-1";
import { LoteProducaoAddStep2 } from "@/components/Forms/LoteProducao/AddFormSteps/step-2";
import { LoteProducaoAddStep3 } from "@/components/Forms/LoteProducao/AddFormSteps/step-3";
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
      <Accordion type="multiple" defaultValue={["dados", "tecidos", "grades"]} className="w-full border rounded-md px-4">
        <AccordionItem value="dados">
          <AccordionTrigger>1. Dados do Lote</AccordionTrigger>
          <AccordionContent>
            <LoteProducaoAddStep1 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tecidos">
          <AccordionTrigger>2. Rolos de Tecido</AccordionTrigger>
          <AccordionContent>
            <LoteProducaoAddStep2 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grades">
          <AccordionTrigger>3. Produtos e Grades</AccordionTrigger>
          <AccordionContent>
            <LoteProducaoAddStep3
              isEditing={isEditing}
              gradeEdicao={gradeEdicao}
              handleAdicionarItens={handleAdicionarItens}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
