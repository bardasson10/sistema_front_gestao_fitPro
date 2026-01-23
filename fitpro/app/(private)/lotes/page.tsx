'use client';
import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoForm } from "@/components/Forms/LoteProducao/loteProducao-form";

import { FormModal } from "@/components/Modal/base-modal-form";
import STEPS from "@/components/StepIndicator/LoteProducaoForm/steps";
import StepIndicator from "@/components/StepIndicator/step-indicador";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useProduction } from "@/providers/PrivateContexts/ProductionProvider";
import { LoteProducaoFormValues, loteProducaoSchema } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Colaborador } from "@/types/production";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus, Save, Scissors, ScissorsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";



const initialValues: LoteProducaoFormValues = {
  codigo: '',
  status: '',
  dataCreacao: new Date(),
  responsavelId: '',
  responsavel: {} as Colaborador,
  grade: [],
  tecidosUtilizados: [],
  direcionamentos: [],

};

export default function Lotes() {
  const { lotes, updateLote, addLote, isLoading } = useProduction();
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = STEPS.length
  const CurrentStepComponent = STEPS.find(step => step.id === currentStep)?.component

  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoSchema),
    defaultValues: initialValues,
  });

  const {
    isOpen,
    editingItem,
    handleRemove,
    removingItemId,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
    isRemoveOpen,
    setIsRemoveOpen,
  } = useFormModal({
    form,
    initialValues,
    onSave: (values, id?: string) => {
      if (id) {
        updateLote(id, values);
      } else {
        addLote(values);
      }
      handleClose();
    }
  });

  const nextStep = async () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground p-4 items-center">
          {lotes.length} lotes cadastrados
        </div>

        {!editingItem && (<FormModal
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
                    onClick={() => { onSubmit(); handleClose(); }}
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
        </FormModal>)}

        {editingItem && (<FormModal
          key={"modal-edit"}
          open={isOpen}
          onClose={handleClose}
          Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
          title={`Detalhes do Lote ${form.getValues('codigo')}`}
          onSubmit={onSubmit}
          loading={isSubmitting}
        >
          <Form {...form}>
            <LoteProducaoForm />
          </Form>
        </FormModal>)}
      </div>

      <div className="hidden md:block">
        <LoteProducaoTable
          lotesProducao={lotes}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>
    </main>
  )
}