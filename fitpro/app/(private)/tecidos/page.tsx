'use client';
import { useState } from 'react';
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
import { on } from 'events';
import { MobileViewFabric } from '@/components/Cards/FabricCard';

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
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting
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
        <div className="text-sm text-muted-foreground">
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


      <div className="hidden md:block">
        <FabricTable
          tecido={tecidos}
          isLoading={isLoading}
          fornecedores={fornecedores}
          onEdit={handleEdit}
          onRemove={removeTecido}
        />
      </div>

      {/* Versão Mobile - Escondida em telas maiores que MD */}
      <div className="block md:hidden">
        <MobileViewFabric
          tecido={tecidos}
          isLoading={isLoading}
          fornecedores={fornecedores}
          onEdit={handleEdit}
          onRemove={removeTecido}
        />
      </div>

    </main>
  );
}

