'use client';

import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoAccordionForm } from "@/components/Forms/LoteProducao/AddFormSteps/accordion-form";
import { FormModal } from "@/components/Modal/base-modal-form";
import { MobileViewLoteProducao } from "@/components/MobileViewCards/LoteProducaoCard";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormModal } from "@/hooks/use-form-modal";
import {
  useAdicionarItensLoteProducao,
  useAtualizarLoteProducao,
  useCriarLoteProducao,
  useLotesProducao,
} from "@/hooks/queries/useProducao";
import { useGradeEdicao } from "@/hooks/use-grade-edicao";
import { initialValuesLote, LoteProducaoFormValues, loteProducaoSchema } from "@/schemas/LoteProducao/lote-producao-schemas";
import { LoteProducao } from "@/types/production";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, ScissorsIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Lotes() {
  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const { mutate: criar } = useCriarLoteProducao();
  const { mutate: atualizar } = useAtualizarLoteProducao();
  const { mutate: adicionarItens } = useAdicionarItensLoteProducao();

  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoSchema),
    defaultValues: initialValuesLote,
    mode: 'onChange',
  });

  const {
    isOpen,
    editingItem,
    handleOpen,
    handleEdit,
    handleClose,
    onSubmit,
    isSubmitting,
  } = useFormModal({
    form,
    initialValues: initialValuesLote,
    onInvalid: () => {
      toast.error('Preencha os campos obrigatórios para criar o lote.');
    },
    onSave: (values, id) => {
      const itemsPayload = values.items.map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        quantidadePlanejada: item.quantidadePlanejada,
        corId: item.corId || values.tecido.corId || "",
        rolos: item.rolos || [],
      }));

      const payload = {
        codigoLote: values.codigoLote,
        responsavelId: values.responsavelId,
        status: values.status,
        observacao: values.observacao || "",
      };

      if (id && editingItem) {
        atualizar({
          id,
          dados: {
            ...payload,
            items: itemsPayload,
          },
        });
        return;
      }

      criar({
        ...payload,
        items: itemsPayload,
      });
    },
  });

  const gradeEdicao = useGradeEdicao(editingItem !== null);

  const handleAdicionarItens = () => {
    const values = form.getValues();

    if (!editingItem?.id) return;

    const existingItems = ((editingItem as LoteProducao | null)?.items ?? []);
    const existingKeys = new Set(existingItems.map((item) => `${item.produtoId}::${item.tamanhoId}`));

    const itemsPayload = values.items
      .filter((item) => item.produtoId && item.tamanhoId)
      .filter((item) => !existingKeys.has(`${item.produtoId}::${item.tamanhoId}`))
      .map((item) => ({
        produtoId: item.produtoId,
        tamanhoId: item.tamanhoId,
        quantidadePlanejada: item.quantidadePlanejada,
        corId: item.corId || values.tecido.corId || "",
        rolos: item.rolos || [],
      }));

    if (itemsPayload.length === 0) {
      toast.info("Nenhum item novo para adicionar.");
      return;
    }

    adicionarItens({
      id: editingItem.id,
      items: itemsPayload,
    });
  };

  const dataLote = lotesData?.data || [];

  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground p-4 items-center">
          {dataLote?.length || 0} lotes cadastrados
        </div>

        <FormModal
          key={editingItem ? "modal-edit" : "modal-create"}
          trigger={(
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" /> Novo Lote
            </Button>
          )}
          open={isOpen}
          onOpen={() => {
            if (!isOpen) {
              handleOpen();
            }
          }}
          onClose={handleClose}
          Icon={<ScissorsIcon className="mr-2 h-6 w-6" />}
          title={editingItem ? `Editar Lote ${form.getValues('codigoLote')}` : 'Novo Lote'}
          onSubmit={onSubmit}
          loading={isSubmitting}
        >
          <Form {...form}>
            <div className="flex flex-col gap-4">
              <LoteProducaoAccordionForm
                isEditing={Boolean(editingItem)}
                gradeEdicao={gradeEdicao}
                handleAdicionarItens={handleAdicionarItens}
              />

              <div className="flex justify-end items-center border-t pt-4">
                <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" /> {editingItem ? 'Atualizar Lote' : 'Criar Lote'}
                </Button>
              </div>
            </div>
          </Form>
        </FormModal>
      </div>

      <div className="hidden md:block">
        <LoteProducaoTable
          lotesProducao={dataLote}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewLoteProducao
          lotesProducao={dataLote as LoteProducao[]}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>
    </main>
  );
}
