'use client';
import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoForm } from "@/components/Forms/LoteProducao/loteProducao-form";
import { FormModal } from "@/components/Modal/base-modal-form";
import STEPS from "@/components/StepIndicator/LoteProducaoForm/steps";
import StepIndicator from "@/components/StepIndicator/step-indicador";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useLotesProducao, useCriarLoteProducao, useAtualizarLoteProducao, useAdicionarItensLoteProducao } from "@/hooks/queries/useProducao";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { initialValuesLote, LoteProducaoFormValues, loteProducaoSchema } from "@/schemas/LoteProducao/lote-producao-schemas";
import { ColaboradorLote, LoteProducao, Produto } from "@/types/production";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus, Save, ScissorsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { parseNumber } from "@/utils/Formatter/parse-number-format";;
import { toast } from "sonner";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { useGradeEdicao } from "@/hooks/use-grade-edicao";




export default function Lotes() {
  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const { mutate: criar, isPending: isCreating } = useCriarLoteProducao();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarLoteProducao();
  const { mutate: adicionarItens } = useAdicionarItensLoteProducao();



  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = STEPS.length;
  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component;
  
  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoSchema),
    defaultValues: initialValuesLote,
    mode: 'onChange',
  });
  

  const handleAdicionarItens = () => {
    const values = form.getValues();

    if (!editingItem?.id) return;

    const existingItems = ((editingItem as LoteProducao | null)?.items ?? []);
    const existingKeys = new Set(
      existingItems.map((item) => `${item.produtoId}::${item.tamanhoId}`)
    );

    const itemsPayload = values.items
      .filter((item) => item.produtoId && item.tamanhoId && item.quantidadePlanejada > 0)
      .filter((item) => !existingKeys.has(`${item.produtoId}::${item.tamanhoId}`))
      .map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        quantidadePlanejada: item.quantidadePlanejada,
      }));

    if (itemsPayload.length === 0) {
      toast.info("Nenhum item novo para adicionar.");
      return;
    }

    adicionarItens({
      id: editingItem.id,
      items: itemsPayload,
    });
  };
  
  
  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
  } = useFormModal({
    form: form,
    initialValues: initialValuesLote,
    onInvalid: () => {
      toast.error('Preencha os campos obrigatórios para criar o lote.');
      console.log('Form validation failed:', form.formState.errors);
    },
    onSave: (values, id) => {
      
      
      const itemsPayload = values.items.map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        quantidadePlanejada: item.quantidadePlanejada,
      }));
      
      const rolosPayload = values.tecido.rolos.itens.map((rolo) => ({
        estoqueRoloId: rolo.id,
        pesoReservado: rolo.pesoReservado,
      }));
      
      
      const payload = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavelId,
        status: values.status,
        observacao: values.observacao || "",
      };
      if (id && editingItem) {
        
        atualizar({
          id,
          ...payload,
          rolos: rolosPayload,
          items: itemsPayload
        });
        
      } else {
        
        criar({
          ...payload,
          rolos: rolosPayload,
          items: itemsPayload,
        })
      }
          }
  });
  const gradeEdicao = useGradeEdicao(editingItem !== null);








  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };



  const dataLote = lotesData?.data || [];



  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground p-4 items-center">
          {dataLote?.length || 0} lotes cadastrados
        </div>

        <FormModal
          key={editingItem ? "modal-edit" : "modal-create"}
          trigger={(
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" /> Novo Lote
            </Button>
          )}
          open={isOpen}
          onOpen={() => {
            if (!isOpen) {
              setCurrentStep(1);
              handleOpen();
            }
          }}
          onClose={() => { handleClose(); setCurrentStep(1); }}
          Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
          title={editingItem ? `Editar Lote ${form.getValues('codigoLote')}` : 'Novo Lote'}
          onSubmit={onSubmit}
          loading={isSubmitting}
        >
          <Form {...form}>
            <div className="flex flex-col h-full min-h-100">
              <div className="mb-6">
                <StepIndicator
                  currentStep={currentStep}
                  titles={STEPS.map(t => t.title)}
                  totalSteps={totalSteps}
                />
              </div>

              <div className="flex-1 py-4">
                {CurrentStepComponent && <CurrentStepComponent 
                  gradeEdicao={gradeEdicao}
                  handleAdicionarItens={handleAdicionarItens}
                />}
              </div>

              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? "invisible" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" /> {editingItem ? 'Atualizar Lote' : 'Criar Lote'}
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Próximo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </FormModal>
      </div>

      <div className="hidden md:block">
        <LoteProducaoTable
          lotesProducao={dataLote}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>
    </main>
  )
}