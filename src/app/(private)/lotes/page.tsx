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
    useDeletarLoteProducao,
    useLotesProducao,
} from "@/hooks/queries/useProducao";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import {
    initialValuesLote,
    loteProducaoFormSchema,
    LoteProducaoFormValues,
} from "@/schemas/LoteProducao/lote-producao-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Lotes() {
    const { data: lotesData = { data: [], pagination: {} }, isLoading } = useLotesProducao();
    const dataLote = lotesData.data || [];

    const { mutate: deletarLote, isPending: isDeleting } = useDeletarLoteProducao();
    const { handleEditLoteCabeçalho, isSubmitting } = useProducaoActions();

    const { data: colaboradoresData } = useColaboradores();
    const [openCreateFormModal, setOpenCreateFormModal] = useState(false);
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ApiLoteProducaoResponse> | null>(null);

    const form = useForm<LoteProducaoFormValues>({
        resolver: zodResolver(loteProducaoFormSchema),
        defaultValues: initialValuesLote,
    });

    const mapLoteToFormValues = (item: Partial<ApiLoteProducaoResponse>): LoteProducaoFormValues => ({
        ...initialValuesLote,
        id: item.id ?? initialValuesLote.id,
        codigoLote: item.codigoLote ?? initialValuesLote.codigoLote,
        tecidoId: item.tecidoId ?? initialValuesLote.tecidoId,
        status: item.status ?? initialValuesLote.status,
        observacao: item.observacao ?? initialValuesLote.observacao,
        createdAt: item.createdAt ?? initialValuesLote.createdAt,
        updatedAt: item.updatedAt ?? initialValuesLote.updatedAt,
        responsavel: {
            id: item.responsavel?.id ?? initialValuesLote.responsavel.id,
            nome: item.responsavel?.nome ?? initialValuesLote.responsavel.nome,
            funcaoSetor: item.responsavel?.funcaoSetor ?? initialValuesLote.responsavel.funcaoSetor,
        },
        materiais: (item.materiais || []).flatMap((material) => ({
            tecidoId: material.tecidoId || "",
            nome: material.nome || "",
            codigReferencia: material.codigoReferencia || "",
            rendimentoMetroKg: Number(material.rendimentoMetroKg || 0),
            larguraMetro: Number(material.larguraMetros || 0),
            gramatura: Number(material.gramatura || 0),
            valorPorKg: Number(material.valorPorKg || 0),
            pesoTotal: Number(material.pesoTotal || 0),
            cores: (material.cores || []).flatMap((cor) => {
                const qtdFolhas = Number(cor.qtdFolhas || 0);

                return {
                    id: cor.corId || "",
                    nome: cor.nome || "",
                    codigoHex: cor.codigoHex || "",
                    qtdFolhas,
                    rolos: (cor.rolos || []).flatMap((rolo) => ({
                        id: rolo.id || "",
                        codigoBarraRolo: rolo.codigoBarraRolo || "",
                        pesoAtualKg: Number(rolo.pesoAtualKg || 0),
                        pesoReservado: Number(rolo.pesoReservado || 0),
                        situacao: rolo.situacao || "",
                    })),
                    gradeLote: (cor.gradeLote || []).flatMap((grade) => {
                        const quantidadePlanejada = Number(grade.quantidadePlanejada || 0);
                        const qtdMultiplicadorGrade = Number(
                            grade.qtdMultiplicadorGrade ?? (qtdFolhas > 0 ? quantidadePlanejada / qtdFolhas : 0),
                        );

                        return {
                            id: grade.id || "",
                            produtoId: grade.produtoId || "",
                            tamanhoId: grade.tamanhoId || "",
                            qtdMultiplicadorGrade,
                            quantidadePlanejada,
                            produtoNome: grade.produtoNome || grade.produto?.nome || "",
                            sku: grade.sku || grade.produto?.sku || "",
                            tamanhoNome: grade.tamanhoNome || grade.tamanho?.nome || "",
                        };
                    }),
                };
            }),
        })),
        direcionamento: (item.direcionamentos || []).flatMap((direcionamento) => ({
            id: direcionamento.id || "",
            faccaoId: direcionamento.faccaoId || "",
            tipoServico: direcionamento.tipoServico || "",
            status: direcionamento.status || "",
            dataPrevisaoRetorno: direcionamento.dataPrevisaoRetorno || "",
        })),
    });

    const selectedLote = editingItem
        ? dataLote.find((l) => l.id === editingItem.id) ?? (editingItem as ApiLoteProducaoResponse)
        : null;

    const handleEdit = (item: ApiLoteProducaoResponse) => {
        setEditingItem(item);
        form.reset(mapLoteToFormValues(item));
    };

    const handleRemove = (id: string) => {
        setRemovingItemId(id);
        setIsRemoveOpen(true);
    };

    return (
        <main className="space-y-6">
            <Tabs defaultValue="lotes-cadastrados" className="w-full">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="h-auto w-full flex-col sm:h-10 sm:w-auto sm:flex-row">
                        <TabsTrigger value="lotes-cadastrados" className="w-full justify-center text-xs sm:w-auto sm:text-sm">
                            Lotes Cadastrados
                        </TabsTrigger>
                        <TabsTrigger value="resumo-grade-por-cor" className="w-full justify-center text-xs sm:w-auto sm:text-sm">
                            Resumo Grade por Cor
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                        <div className="text-sm text-muted-foreground">{dataLote?.length || 0} lotes cadastrados</div>
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
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingItem(null);
                        form.reset(initialValuesLote);
                    }
                }}
                description="Aqui voce editar um lote existente"
            >
                {selectedLote && (
                    <Form {...form}>
                        <LoteProducaoAccordionForm
                            form={form}
                            lote={selectedLote}
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
