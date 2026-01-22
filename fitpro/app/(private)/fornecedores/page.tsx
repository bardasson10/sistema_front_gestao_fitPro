'use client';

import { FornecedorTable } from "@/components/DataTable/Tables/Fornecedores/table";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { FornecedoresForm } from "@/components/Forms/fornecedor-from";
import { MobileViewFornecedor } from "@/components/MobileViewCards/FornecedorCard";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import { useProduction } from "@/providers/PrivateContexts/ProductionProvider";
import { FornecedorFormValues, fornecedorSchema } from "@/schemas/fornecedor-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

const initialValues: FornecedorFormValues = {
  nome: '',
  tipo: '',
  contato: '',
};
  

export default function Fornecedores() {
  const { fornecedores, addFornecedor, updateFornecedor, removeFornecedor, isLoading } = useProduction();


  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
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
        updateFornecedor(id, values);
      } else {
        addFornecedor(values);
      }
      handleClose();
    }

  });




  return (
    <main>
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-muted-foreground p-4 items-center">
          {fornecedores.length} fornecedores cadastrados
        </div>

        <FormModal
          open={isOpen}
          onClose={handleClose}
          title={editingItem ? 'Editar Fornecedor' : "Novo Fornecedor"}
          onSubmit={onSubmit}
          loading={isSubmitting}
          trigger={
            <Button onClick={handleOpen} >
              <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
            </Button>
          }
        >

          <Form {...form} >
            <FornecedoresForm />
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
            removeFornecedor(id);
            setIsRemoveOpen(false); 
          }}
        />  

      <div className="hidden md:block">
        <FornecedorTable        
          fornecedores={fornecedores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFornecedor
          fornecedores={fornecedores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

    </main>
  );
}