'use client';

import { FabricTable } from '@/components/DataTable/Tables/Tecido/table';
import { RemoveItemWarning } from '@/components/ErrorManagementComponent/WarnningRemoveItem';
import { FabricForm } from '@/components/Forms/fabric-form';
import { MobileViewFabric } from '@/components/MobileViewCards/FabricCard';
import { FormModal } from '@/components/Modal/base-modal-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useFormModal } from '@/hooks/use-form-modal';
import {
  useTecidos,
  useCriarTecido,
  useAtualizarTecido,
  useDeletarTecido,
  useFornecedores,
  useCores,
} from '@/hooks/queries/useMateriais';
import { FabricFormValues, fabricSchema } from '@/schemas/tecido-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { parseNumber } from '@/utils/Formatter/parse-number-format';

const initialValues: FabricFormValues = {
  fornecedorId: '',
  corId: '',
  nome: '',
  codigoReferencia: '',
  rendimentoMetroKg: 0,
  larguraMetros: 0,
  valorPorKg: 0,
  gramatura: 0,
};

export default function Tecidos() {
  // Queries
  const { data: tecidosData, isLoading } = useTecidos();
  const tecidos = tecidosData || [];
  
  const { data: fornecedoresData } = useFornecedores();
  const fornecedores = fornecedoresData || [];

  const { data: coresData } = useCores();
  const cores = coresData || [];

  // Mutations
  const { mutate: criar, isPending: isCreating } = useCriarTecido();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarTecido();
  const { mutate: deletar } = useDeletarTecido();

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
        atualizar({ 
          id, 
          fornecedorId: values.fornecedorId,
          corId: values.corId,
          nome: values.nome,
          codigoReferencia: values.codigoReferencia || '',
          rendimentoMetroKg: parseNumber(values.rendimentoMetroKg) || 0,
          larguraMetros: parseNumber(values.larguraMetros) || 0,
          valorPorKg: parseNumber(values.valorPorKg) || 0,
          gramatura: parseNumber(values.gramatura) || 0,
        });
      } else {
        criar({
          fornecedorId: values.fornecedorId,
          corId: values.corId,
          nome: values.nome,
          codigoReferencia: values.codigoReferencia || '',
          rendimentoMetroKg: parseNumber(values.rendimentoMetroKg) || 0,
          larguraMetros: parseNumber(values.larguraMetros) || 0,
          valorPorKg: parseNumber(values.valorPorKg) || 0,
          gramatura: parseNumber(values.gramatura) || 0,
        });
      }
      handleClose();
    },
  });

  // Resetar formulário quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset(initialValues);
    }
  }, [isOpen, form]);

  // Atualizar formulário quando selecionando item para editar
  useEffect(() => {
    if (editingItem) {
      form.reset(editingItem as FabricFormValues);
    }
  }, [editingItem, form]);


  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {tecidos.length} tecidos cadastrados
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tecido
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? 'Editar Tecido' : 'Novo Tecido'}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <FabricForm fornecedores={fornecedores} cores={cores} />
        </Form>
      </FormModal>

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
        <FabricTable
          tecidos={tecidos}
          isLoading={isLoading || isCreating || isUpdating}
          fornecedores={fornecedores}
          cores={cores}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFabric
          tecidos={tecidos}
          isLoading={isLoading || isCreating || isUpdating}
          fornecedores={fornecedores}
          cores={cores}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}

