
'use client';

import { FaccoesTable } from "@/components/DataTable/Tables/Faccoes/table";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { FaccaoForm } from "@/components/Forms/faccoes-form";
import { MobileViewFaccao } from "@/components/MobileViewCards/FaccaoCard";

import { FormModal } from "@/components/Modal/base-modal-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useProduction } from "@/providers/PrivateContexts/ProductionProvider";
import { FaccoesFormValues, faccoesSchema } from "@/schemas/faccoes-schemas";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

const initialValues: FaccoesFormValues = {
  nome: '',
  responsavel: '',
  contato: '',
  prazoMedio: 0,
  status: '',
};
  

export default function Faccoes() {
  const { faccoes, addFaccao, updateFaccao, removeFaccao, isLoading } = useProduction();


  const form = useForm<FaccoesFormValues>({
    resolver: zodResolver(faccoesSchema),
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
    onSave: (values, id) => {
      if (id) {
        updateFaccao(id, values);
      } else {
        addFaccao(values);
      }
      handleClose();
    }

  });




  return (
    <main>
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-muted-foreground p-4 items-center">
          {faccoes.length} facções cadastradas
        </div>

        <FormModal
          open={isOpen}
          onClose={handleClose}
          title={editingItem ? 'Editar Facção' : "Nova Facção"}
          onSubmit={onSubmit}
          loading={isSubmitting}
          trigger={
            <Button onClick={handleOpen} >
              <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
            </Button>
          }
        >

          <Form {...form} >
            <FaccaoForm/>
          </Form>

        </FormModal>
      </div>


      {/* so abre quando clicar para remover */}
        <RemoveItemWarning
          id={removingItemId || ''}
          isOpen={isRemoveOpen}
          onClose={() => setIsRemoveOpen(false)} 
          title='Deseja Remover?'
          onConfirm={(id) => {
            removeFaccao(id);
            setIsRemoveOpen(false); 
          }}
        />  

      <div className="hidden md:block">
        <FaccoesTable
          faccoes={faccoes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFaccao
          faccoes={faccoes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

    </main>
  );
}