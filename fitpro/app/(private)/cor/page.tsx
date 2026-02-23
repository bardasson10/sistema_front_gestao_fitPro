

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/Modal/base-modal-form";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { CoresTable } from "@/components/DataTable/Tables/Cores/table";
import { MobileViewCor } from "@/components/MobileViewCards/CorCard";
import { CorForm } from "@/components/Forms/cor-form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  useCores,
  useCriarCor,
  useAtualizarCor,
  useDeletarCor,
} from "@/hooks/queries/useMateriais";
import { CorFormValues, corSchema } from "@/schemas/cor-schema";
import { Cor } from "@/types/production";

const initialValues: CorFormValues = {
  nome: "",
  codigoHex: "",
};

export default function CorPage() {
  const { data: coresData, isLoading } = useCores();
  const cores = (coresData || []) as Cor[];

  const { mutate: criar, isPending: isCreating } = useCriarCor();
  const { mutate: atualizar, isPending: isUpdating } = useAtualizarCor();
  const { mutate: deletar } = useDeletarCor();

  const form = useForm<CorFormValues>({
    resolver: zodResolver(corSchema),
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
  } = useFormModal<CorFormValues, Cor>({
    form,
    initialValues,
    transformItemToForm: (item) => ({
      nome: item.nome,
      codigoHex: item.codigoHex,
    }),
    onSave: (values, id) => {
      if (id) {
        atualizar({ id, nome: values.nome, codigoHex: values.codigoHex });
      } else {
        criar({ nome: values.nome, codigoHex: values.codigoHex });
      }
    },
  });

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{cores.length} cores cadastradas</div>

        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" /> Nova Cor
        </Button>
      </div>

      <FormModal
        open={isOpen}
        onClose={handleClose}
        title={editingItem ? "Editar Cor" : "Nova Cor"}
        onSubmit={onSubmit}
        loading={isSubmitting || isCreating || isUpdating}
        isViewSaveOrCancel={true}
      >
        <Form {...form}>
          <CorForm />
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
        <CoresTable
          cores={cores}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewCor
          cores={cores}
          isLoading={isLoading || isCreating || isUpdating}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}