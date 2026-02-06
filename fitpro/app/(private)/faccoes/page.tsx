'use client';

import { FaccoesTable } from "@/components/DataTable/Tables/Faccoes/table";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { FaccaoForm } from "@/components/Forms/faccoes-form";
import { MobileViewFaccao } from "@/components/MobileViewCards/FaccaoCard";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  useFaccoes,
  useCriarFaccao,
  useAtualizarFaccao,
  useDeletarFaccao,
} from "@/hooks/queries/useProducao";
import { FaccoesFormValues, faccoesSchema } from "@/schemas/faccoes-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const initialValues: FaccoesFormValues = {
  nome: '',
  responsavel: '',
  contato: '',
  prazoMedioDias: 0,
  status: '',
};

export default function Faccoes() {
  // Queries
  const { data: faccoesData, isLoading } = useFaccoes();
  const faccoes = faccoesData || [];

  // Mutations
  const { mutate: criar, isPending: isCreating } = useCriarFaccao();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarFaccao();
  const { mutate: deletar } = useDeletarFaccao();

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
        atualizar({ id, ...values });
      } else {
        criar({
          nome: values.nome,
          responsavel: values.responsavel,
          contato: values.contato,
          prazoMedioDias: values.prazoMedioDias,
          status: values.status as 'ativo' | 'inativo',
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
      form.reset(editingItem as FaccoesFormValues);
    }
  }, [editingItem, form]);

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {faccoes.length} facções cadastradas
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Nova Facção
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? 'Editar Facção' : 'Nova Facção'}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <FaccaoForm isEditing={!!editingItem} />
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
        <FaccoesTable
          faccoes={faccoes}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFaccao
          faccoes={faccoes}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}
