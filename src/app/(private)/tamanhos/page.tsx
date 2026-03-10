"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/Modal/base-modal-form";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { TamanhoTable } from "@/components/DataTable/Tables/Tamanho/table";
import { MobileViewTamanho } from "@/components/MobileViewCards/TamanhoCard";
import { TamanhoForm } from "@/components/Forms/tamanho-form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  Tamanho,
  useTamanhos,
  useCriarTamanho,
  useAtualizarTamanho,
  useDeletarTamanho,
} from "@/hooks/queries/useProdutos";
import { tamanhoSchema, TamanhoFormValues } from "@/schemas/tamanho-schema";

const initialValues: TamanhoFormValues = {
  nome: "",
  ordem: 1,
};

export default function TamanhosPage() {
  const { data: tamanhosData, isLoading } = useTamanhos();
  const tamanhos = (tamanhosData || []) as Tamanho[];

  const { mutate: criar, isPending: isCreating } = useCriarTamanho();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarTamanho();
  const { mutate: deletar } = useDeletarTamanho();

  const form = useForm<TamanhoFormValues>({
    resolver: zodResolver(tamanhoSchema),
    defaultValues: initialValues,
  });

  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    handleRemove,
    removingItemId,
    onSubmit,
    isSubmitting,
    isRemoveOpen,
    setIsRemoveOpen,
  } = useFormModal<TamanhoFormValues, Tamanho>({
    form,
    initialValues,
    transformItemToForm: (item) => ({
      nome: item.nome,
      ordem: item.ordem,
    }),
    onSave: (values, id) => {
      if (id) {
        atualizar({ id, nome: values.nome, ordem: values.ordem });
      } else {
        criar({ nome: values.nome, ordem: values.ordem });
      }
    },
  });

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {tamanhos.length} tamanhos cadastrados
        </div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tamanho
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? "Editar Tamanho" : "Novo Tamanho"}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <TamanhoForm />
        </Form>
      </FormModal>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletar(id);
          setIsRemoveOpen(false);
        }}
      />

      <div className="hidden md:block">
        <TamanhoTable
          tamanhos={tamanhos}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewTamanho
          tamanhos={tamanhos}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}
