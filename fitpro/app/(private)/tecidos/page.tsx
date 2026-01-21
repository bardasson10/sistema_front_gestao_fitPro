'use client';
import { Button } from '@/components/ui/button';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { Plus } from 'lucide-react';
import { FabricTable } from '@/components/Tables/Tecido/table';
import { FormModal } from '@/components/Modal/base-modal-form';
import { FabricForm } from '@/components/Forms/fabric-form';
import { Form } from '@/components/ui/form';
import { FabricFormValues, fabricSchema } from '@/schemas/tecido-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormModal } from '@/hooks/use-form-modal';
import { MobileViewFabric } from '@/components/MobileViewCards/FabricCard';
import { RemoveItemWarning } from '@/components/ErrorManagementComponent/WarnningRemoveItem';

const initialValues: FabricFormValues = {
  tipo: '',
  cor: '',
  largura: 150,
  rendimento: 2.5,
  fornecedorId: '',
  unidade: 'kg'
};

export default function Tecidos() {
  const { tecidos, addTecido, updateTecido, removeTecido, fornecedores, isLoading } = useProduction();


  const form = useForm<FabricFormValues>({
    resolver: zodResolver(fabricSchema),
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
        updateTecido(id, values);
      } else {
        addTecido(values);
      }
      handleClose();
    }

  });




  return (
    <main>
      <div className="flex justify-between items-center mb-6">

        <div className="text-sm text-muted-foreground p-4 items-center">
          {tecidos.length} tecidos cadastrados
        </div>

        <FormModal
          open={isOpen}
          onClose={handleClose}
          title={editingItem ? 'Editar Tecido' : "Novo Tecido"}
          onSubmit={onSubmit}
          loading={isSubmitting}
          trigger={
            <Button onClick={handleOpen} >
              <Plus className="mr-2 h-4 w-4" /> Novo Tecido
            </Button>
          }
        >

          <Form {...form} >
            <FabricForm fornecedores={fornecedores} />
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
            removeTecido(id);
            setIsRemoveOpen(false); 
          }}
        />  

      <div className="hidden md:block">
        <FabricTable
          tecidos={tecidos}
          isLoading={isLoading}
          fornecedores={fornecedores}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFabric
          tecidos={tecidos}
          isLoading={isLoading}
          fornecedores={fornecedores}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

    </main>
  );
}

