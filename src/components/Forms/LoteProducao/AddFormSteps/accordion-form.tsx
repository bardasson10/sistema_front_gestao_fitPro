import { LoteProducaoAddStep1 } from "@/components/Forms/LoteProducao/AddFormSteps/step-1";
import { LoteProducaoAddStep2 } from "@/components/Forms/LoteProducao/AddFormSteps/step-2";
import { useState } from "react";
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
  // Estado para controlar a cor ativa (enfesto em edição)
  const [corAtivaId, setCorAtivaId] = useState<string | null>(null);
  // Estado para lista de enfestos já adicionados
  const [enfestos, setEnfestos] = useState<any[]>([]);

  // Handler para salvar enfesto atual e iniciar novo
  const handleAdicionarCor = () => {
    // TODO: coletar dados do step 3 e 4 para corAtivaId e adicionar em enfestos
    // Limpar campos do step 3/4 para novo enfesto
    setCorAtivaId(null);
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <Accordion type="multiple" defaultValue={["dados", "tecidos", "enfestos-grades"]} className="w-full border rounded-md px-4">
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

        {isEditing && (
          <AccordionItem value="enfestos-grades">
            <AccordionTrigger>3. Enfestos e Produtos/Grades</AccordionTrigger>
            <AccordionContent>
              {/* Step 3: Seleção/edição de cor, qtdFolhas, rolosProducao */}
              <LoteProducaoAddStep3 corAtivaId={corAtivaId} setCorAtivaId={setCorAtivaId} />
              {/* Step 4: Grade de produtos/tamanhos/quantidade para a cor ativa */}
              {corAtivaId && (
                <div className="mt-6">
                  <LoteProducaoAddStep4
                    corAtivaId={corAtivaId}
                    isEditing={isEditing}
                    gradeEdicao={gradeEdicao}
                    handleAdicionarItens={handleAdicionarItens}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAdicionarCor}
                    >
                      Adicionar mais uma cor
                    </button>
                  </div>
                </div>
              )}
              {/* Lista de enfestos já adicionados (opcional: mostrar resumo) */}
              {enfestos.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold">Enfestos adicionados:</h4>
                  <ul className="list-disc ml-6">
                    {enfestos.map((enf, idx) => (
                      <li key={idx} className="text-sm">Cor: {enf.corId} - {enf.qtdFolhas} folhas - {enf.itens?.length || 0} itens</li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
