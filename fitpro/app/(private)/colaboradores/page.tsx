'use client';
import { ColaboradorTable } from "@/components/DataTable/Tables/Colaboradores/table";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { ColaboradoresForm } from "@/components/Forms/colaboradores-form";
import { MobileViewColaborador } from "@/components/MobileViewCards/ColaboradorCard";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAtualizarColaborador, useColaborador, useColaboradores, useCriarColaborador, useDeletarColaborador } from "@/hooks/queries/useColaboradores";
import { useAuth } from "@/hooks/use-auth";
import { useFormModal } from "@/hooks/use-form-modal";
import { ColaboradorFormValues, colaboradorSchema } from "@/schemas/colaborador-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

const initialValues: ColaboradorFormValues = {
  nome: '',
  email: '',
  perfil: '',
  funcaoSetor: '',
  status: '',
};
  

export default function Colaboradores() {

  const { user } = useAuth();
  
  const { data: colaboradoresData, isLoading } = useColaboradores({
    userPerfil: user.perfil as 'ADM' | 'GERENTE' | 'FUNCIONARIO',
    excludeUserId: user.id,
  });

  const colaboradores = colaboradoresData?.data || [];

  const {mutate: criarColaborador, isPending: isCreating} = useCriarColaborador();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarColaborador();
  const { mutate: deletar } = useDeletarColaborador();

  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorSchema),
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
        atualizar({ id, ...values });
      } else {
        criarColaborador(values);
      }
      handleClose();
    }

  });




  return (
    <main>
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-muted-foreground p-4 items-center">
          {colaboradoresData?.pagination.total || 0} colaboradores cadastrados
        </div>

        <FormModal
          open={isOpen}
          onClose={handleClose}
          title={editingItem ? 'Editar Colaborador' : "Novo Colaborador"}
          onSubmit={onSubmit}
          loading={isSubmitting}
          isViewSaveOrCancel={true}
          trigger={
            <Button onClick={handleOpen} >
              <Plus className="mr-2 h-4 w-4" /> Novo Colaborador
            </Button>
          }
        >

          <Form {...form} >
            <ColaboradoresForm />
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
            deletar(id);
            setIsRemoveOpen(false); 
          }}
        />  

      <div className="hidden md:block">
        <ColaboradorTable
          colaboradores={colaboradores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewColaborador
          colaboradores={colaboradores}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

    </main>
  );
}