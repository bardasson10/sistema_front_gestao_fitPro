'use client';

import { FornecedorTable } from "@/components/DataTable/Tables/Fornecedores/table";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { FornecedoresForm } from "@/components/Forms/fornecedor-from";
import { MobileViewFornecedor } from "@/components/MobileViewCards/FornecedorCard";
import { FormModal } from "@/components/Modal/base-modal-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  useFornecedores,
  useCriarFornecedor,
  useAtualizarFornecedor,
  useDeletarFornecedor,
} from "@/hooks/queries/useMateriais";
import { FornecedorFormValues, fornecedorSchema } from "@/schemas/fornecedor-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const initialValues: FornecedorFormValues = {
  nome: '',
  tipo: 'tecido',
  contato: '',
};

export default function Fornecedores() {
  // Queries
  const { data: fornecedoresData, isLoading } = useFornecedores();
  const fornecedores = fornecedoresData || [];

  // Mutations
  const { mutate: criar, isPending: isCreating } = useCriarFornecedor();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarFornecedor();
  const { mutate: deletar } = useDeletarFornecedor();

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
        atualizar({ id, ...values });
      } else {
        criar({
          nome: values.nome,
          tipo: values.tipo as string,
          contato: values.contato,
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
      form.reset(editingItem as FornecedorFormValues);
    }
  }, [editingItem, form]);

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {fornecedores.length} fornecedores cadastrados
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
      >
        <Form {...form}>
          <FornecedoresForm />
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
        <FornecedorTable
          fornecedores={fornecedores}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewFornecedor
          fornecedores={fornecedores}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );

}