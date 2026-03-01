'use client';

import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { LoteProducaoAccordionForm } from "@/components/Forms/LoteProducao/accordion-lote-form";
import { CreateLoteForm } from "@/components/Forms/LoteProducao/AddFormSteps/createLoteForm";
import { MobileViewLoteProducao } from "@/components/MobileViewCards/LoteProducaoCard";
import { BaseModal } from "@/components/Modal/base-modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useColaboradores } from "@/hooks/queries/useColaboradores";
import { ApiLoteProducaoResponse, useLotesProducao } from "@/hooks/queries/useProducao";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { initialValuesLote, loteProducaoFormSchema, LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";



export default function Lotes() {

  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const dataLote = lotesData.data || [];

  const {
    handleEditLoteCabeçalho, isSubmitting
  } = useProducaoActions();

  const { data: colaboradoresData } = useColaboradores();
  const [openCreateFormModal, setOpenCreateFormModal] = useState(false);


  const [editingItem, setEditingItem] = useState<Partial<ApiLoteProducaoResponse> | null>(null);
  const handleEdit = (item: ApiLoteProducaoResponse) => {
    setEditingItem(item);
  };

  const form = useForm<LoteProducaoFormValues>({
    resolver: zodResolver(loteProducaoFormSchema),
    defaultValues: initialValuesLote,
  });

  useEffect(() => {
    if (!editingItem) {
      form.reset(initialValuesLote);
      return;
    }

    form.reset({
      ...initialValuesLote,
      id: editingItem.id ,
      codigoLote: editingItem.codigoLote ,
      tecidoId: editingItem.tecidoId ,
      status: editingItem.status,
      observacao: editingItem.observacao ,
      createdAt: editingItem.createdAt ,
      updatedAt: editingItem.updatedAt ,
      responsavel: {
        id: editingItem.responsavel?.id ,
        nome: editingItem.responsavel?.nome ,
        funcaoSetor: editingItem.responsavel?.funcaoSetor ,
      },
      materiais: (editingItem.materiais || []).map((material) => ({
        tecidoId: material.tecidoId ,
        nome: material.nome ,
        codigReferencia: material.codigoReferencia ,
        rendimentoMetroKg: Number(material.rendimentoMetroKg || 0),
        larguraMetro: Number(material.larguraMetros || 0),
        gramatura: Number(material.gramatura || 0),
        valorPorKg: Number(material.valorPorKg || 0),
        pesoTotal: Number(material.pesoTotal || 0),
        cores: (material.cores || []).map((cor) => ({
          id: cor.corId ,
          nome: cor.nome ,
          codigoHex: cor.codigoHex ,
          qtdFolhas: Number(cor.qtdFolhas || 0),
          rolos: (cor.rolos || []).map((rolo) => ({
            id: rolo.id ,
            codigoBarraRolo: rolo.codigoBarraRolo ,
            pesoAtualKg: Number(rolo.pesoAtualKg || 0),
            pesoReservado: Number(rolo.pesoReservado || 0),
            situacao: rolo.situacao ,
          })),
          gradeLote: (cor.gradeLote || []).map((grade) => ({
            id: grade.id ,
            produtoId: grade.produtoId ,
            tamanhoId: grade.tamanhoId ,
            quantidadePlanejada: Number(grade.quantidadePlanejada || 0),
            produtoNome: grade.produtoNome || grade.produto?.nome || "" ,
            sku: grade.sku || grade.produto?.sku || "" ,
            tamanhoNome: grade.tamanhoNome || grade.tamanho?.nome || "" ,
          })),
        })),
      })),
      direcionamento: (editingItem.direcionamentos || []).map((direcionamento) => ({
        id: direcionamento.id ,
        faccaoId: direcionamento.faccaoId ,
        tipoServico: direcionamento.tipoServico ,
        status: direcionamento.status ,
        dataPrevisaoRetorno: direcionamento.dataPrevisaoRetorno ,
      })),
    });
  }, [editingItem, form]);




  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground p-4 items-center">
          {dataLote?.length || 0} lotes cadastrados
        </div>
        <Button onClick={() => setOpenCreateFormModal(true)}>
          <PlusIcon className="size-4" />
          Novo Lote
        </Button>
      </div>

      <BaseModal
        title="Criar Novo Lote"
        open={openCreateFormModal}
        onOpenChange={setOpenCreateFormModal}
        description="Aqui voce criar um novo lote"
      >
        <CreateLoteForm colaboradoresResponse={colaboradoresData} fecharModal={() => setOpenCreateFormModal(false)} />
      </BaseModal>

      <BaseModal
        title="Editar Lote"
        open={!!editingItem}
        onOpenChange={() => setEditingItem(null)}
        description="Aqui voce editar um lote existente"
      >
        {editingItem && (
          <Form {...form}>
            <LoteProducaoAccordionForm
              form={form}
              submitting={isSubmitting}
              colaboradoresResponse={colaboradoresData}
              handleEditLoteCabeçalho={handleEditLoteCabeçalho}
            />
          </Form>
        )}
      </BaseModal>

      <div className="hidden md:block">
        <LoteProducaoTable
          lotesProducao={dataLote}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>

      <div className="block md:hidden">
        <MobileViewLoteProducao
          lotesProducao={dataLote}
          isLoading={isLoading}
          onView={handleEdit}
        />
      </div>

    </main>
  );
}
