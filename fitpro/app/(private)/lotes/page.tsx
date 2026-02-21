'use client';
import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoForm } from "@/components/Forms/LoteProducao/loteProducao-form";
import { FormModal } from "@/components/Modal/base-modal-form";
import STEPS from "@/components/StepIndicator/LoteProducaoForm/steps";
import StepIndicator from "@/components/StepIndicator/step-indicador";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useLotesProducao, useCriarLoteProducao, useAtualizarLoteProducao } from "@/hooks/queries/useProducao";
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




export default function Lotes() {
  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const { mutate: criar, isPending: isCreating } = useCriarLoteProducao();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarLoteProducao();
  const { data: produtos = [] } = useProdutos();
  const { data: tamanhos } = useTamanhos();
  const { data: rolos = [] } = useEstoqueTecidos();


  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = STEPS.length;
  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component;

  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoSchema),
    defaultValues: initialValuesLote,
    mode: 'onChange',
  });


  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
  } = useFormModal({
    form: form as any,
    initialValues: initialValuesLote,
    onSave: (values, id) => {


      const payload = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavelId,
        status: values.status,
        observacao: values.observacao || "",
        items: values.items.map((item) => ({
          produtoId: item.produtoId,
          tamanhoId: item.tamanhoId,
          quantidadePlanejada: item.quantidadePlanejada,
        })),
        rolos: values.tecido.rolos.itens.map((rolo) => ({
          estoqueRoloId: rolo.id,
          pesoReservado: rolo.pesoReservado,
        })),
      };


      if (id) {
        // Para atualizar, verifique se sua mutation de update aceita o mesmo payload
        atualizar({ id, ...payload });
      } else {
        // Criar novo lote
        criar(payload);
        console.log("Payload enviado para criação:", payload);
      }
    },
    onInvalid: (errors) => {
      console.log('LoteProducao submit blocked by validation:', errors);
    },
  });





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

        {!editingItem && (
          <FormModal
            key={"modal-Add"}
            open={isOpen}
            onSubmit={onSubmit}
            onClose={() => { handleClose(); setCurrentStep(1); }}
            Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
            title={"Novo Lote "}
            loading={isSubmitting}
            trigger={
              <Button onClick={handleOpen}>
                <Plus className="mr-2 h-4 w-4" /> Novo Lote
              </Button>
            }
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
                  {CurrentStepComponent && <CurrentStepComponent />}
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
                      <Save className="mr-2 h-4 w-4" /> Salvar Lote
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
        )}

        {editingItem && (
          <FormModal
            key={"modal-edit"}
            open={isOpen}
            onClose={handleClose}
            Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
            title={`Editar Lote ${form.getValues('codigoLote')}`}
            onSubmit={onSubmit}
            loading={isSubmitting}
          >
            <Form {...form}>
              <LoteProducaoForm isEditing={!!editingItem} />
            </Form>
          </FormModal>
        )}
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