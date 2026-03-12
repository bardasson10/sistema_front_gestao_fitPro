'use client';


import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";
import { ResumoGradePorCorTabs } from "@/components/DataTable/Tables/LoteProducao/resumo-grade-por-cor-tabs";
import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { LoteProducaoAccordionForm } from "@/components/Forms/LoteProducao/accordion-lote-form";
import { CreateLoteForm } from "@/components/Forms/LoteProducao/subForms/createLoteForm";
import { MobileViewLoteProducao } from "@/components/MobileViewCards/LoteProducaoCard";
import { BaseModal } from "@/components/Modal/base-modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColaboradores } from "@/hooks/queries/useColaboradores";
import {
  ApiLoteProducaoResponse,
  useCriarDirecionamento,
  useDeletarLoteProducao,
  useFaccoes,
  useLotesProducao,
} from "@/hooks/queries/useProducao";

import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { initialValuesLote, loteProducaoFormSchema, LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect,useState } from "react";
import { useForm } from "react-hook-form";





export default function Lotes() {

  const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
  const dataLote = lotesData.data || [];
  const { data: faccoesData } = useFaccoes("ativo");
  const faccoes = faccoesData || [];
  const { mutate: criarDirecionamento, isPending: isCreatingDirecionamento } = useCriarDirecionamento();
  const { mutate: deletarLote, isPending: isDeleting } = useDeletarLoteProducao();

  const {
    handleEditLoteCabeçalho, isSubmitting
  } = useProducaoActions();

  const { data: colaboradoresData } = useColaboradores();
  const [openCreateFormModal, setOpenCreateFormModal] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);


  const [editingItem, setEditingItem] = useState<Partial<ApiLoteProducaoResponse> | null>(null);
  const handleEdit = (item: ApiLoteProducaoResponse) => {
    setEditingItem(item);
  };

  const handleRemove = (id: string) => {
    setRemovingItemId(id);
    setIsRemoveOpen(true);
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
        cores: (material.cores || []).map((cor) => {
          const qtdFolhas = Number(cor.qtdFolhas || 0)

          return {
            id: cor.corId ,
            nome: cor.nome ,
            codigoHex: cor.codigoHex ,
            qtdFolhas,
            rolos: (cor.rolos || []).map((rolo) => ({
              id: rolo.id ,
              codigoBarraRolo: rolo.codigoBarraRolo ,
              pesoAtualKg: Number(rolo.pesoAtualKg || 0),
              pesoReservado: Number(rolo.pesoReservado || 0),
              situacao: rolo.situacao ,
            })),
            gradeLote: (cor.gradeLote || []).map((grade) => {
              const quantidadePlanejada = Number(grade.quantidadePlanejada || 0)
              const qtdMultiplicadorGrade = Number(
                grade.qtdMultiplicadorGrade ?? (qtdFolhas > 0 ? quantidadePlanejada / qtdFolhas : 0),
              )

              return {
                id: grade.id ,
                produtoId: grade.produtoId ,
                tamanhoId: grade.tamanhoId ,
                qtdMultiplicadorGrade,
                quantidadePlanejada,
                produtoNome: grade.produtoNome || grade.produto?.nome || "" ,
                sku: grade.sku || grade.produto?.sku || "" ,
                tamanhoNome: grade.tamanhoNome || grade.tamanho?.nome || "" ,
              }
            }),
          }
        }),
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
      <Tabs defaultValue="lotes-cadastrados" className="w-full">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">
          <TabsList className="w-full flex-col h-auto sm:w-auto sm:flex-row sm:h-10">
            <TabsTrigger value="lotes-cadastrados" className="w-full justify-center sm:w-auto text-xs sm:text-sm">
              Lotes Cadastrados
            </TabsTrigger>
            <TabsTrigger value="resumo-grade-por-cor" className="w-full justify-center sm:w-auto text-xs sm:text-sm">
              Resumo Grade por Cor
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <div className="text-sm text-muted-foreground">
              {dataLote?.length || 0} lotes cadastrados
            </div>
            <Button onClick={() => setOpenCreateFormModal(true)}>
              <PlusIcon className="size-4" />
              Novo Lote
            </Button>
          </div>
        </div>

        <TabsContent value="lotes-cadastrados">
          <div className="hidden md:block">
            <LoteProducaoTable
              lotesProducao={dataLote}
              isLoading={isLoading || isDeleting}
              onView={handleEdit}
              onRemove={handleRemove}
            />
          </div>

          <div className="block md:hidden">
            <MobileViewLoteProducao
              lotesProducao={dataLote}
              isLoading={isLoading || isDeleting}
              onView={handleEdit}
              onRemove={handleRemove}
            />
          </div>
        </TabsContent>

        <TabsContent value="resumo-grade-por-cor">
          <ResumoGradePorCorTabs lotes={dataLote} />
        </TabsContent>
      </Tabs>



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
              lote={dataLote .find(l => l.id === editingItem.id) as ApiLoteProducaoResponse}
              submitting={isSubmitting}
              colaboradoresResponse={colaboradoresData}
              handleEditLoteCabeçalho={handleEditLoteCabeçalho}
            />
          </Form>
        )}
      </BaseModal>

      <RemoveItemWarning
        id={removingItemId || ""}
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Deseja remover?"
        onConfirm={(id) => {
          deletarLote(id);
          setIsRemoveOpen(false);
        }}
      />

    </main>
  );
}
