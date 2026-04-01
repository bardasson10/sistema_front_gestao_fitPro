'use client';

import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";

import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { LoteProducaoAccordionForm } from "@/components/Forms/LoteProducao/accordion-lote-form";
import { CreateLoteForm } from "@/components/Forms/LoteProducao/subForms/createLoteForm";
import { MobileViewLoteProducao } from "@/components/MobileViewCards/LoteProducaoCard";
import { BaseModal } from "@/components/Modal/base-modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColaboradores } from "@/hooks/queries/useColaboradores";
import {
    ApiLoteProducaoResponse,
    useDeletarLoteProducao,
} from "@/hooks/queries/useProducao";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import {
    initialValuesLote,
    loteProducaoFormSchema,
    LoteProducaoFormValues,
} from "@/schemas/LoteProducao/lote-producao-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { STATUS_LOTE_OPTIONS_FILTER } from "@/types/Lote";
import { IFiltrosLote, useGetListAllLotes, useGetResumoPorCor } from "@/hooks/queries/Lote/useLote";
import { ResumoGradePorCorTabs } from "@/components/DataTable/Tables/LoteProducao/resumo-grade-por-cor-tabs";

type IFiltrosFuncionaisLotes = Omit<IFiltrosLote, "page" | "limit">;

const initialFiltros: IFiltrosFuncionaisLotes = {
    status: "",
    codigoLote: "",
    responsavelId: "",
    corId: "",
    produtoId: "",
    dataInicio: "",
    dataFim: "",
};

export default function Lotes() {
    const [filtros, setFiltros] = useState<IFiltrosFuncionaisLotes>(initialFiltros);

    const filtrosAplicados = useMemo<Partial<IFiltrosFuncionaisLotes>>(() => ({
        status: filtros.status || undefined,
        codigoLote: filtros.codigoLote || undefined,
        responsavelId: filtros.responsavelId || undefined,
        corId: filtros.corId || undefined,
        produtoId: filtros.produtoId || undefined,
        dataInicio: filtros.dataInicio || undefined,
        dataFim: filtros.dataFim || undefined,
    }), [filtros]);

    const { data: lotesData, isLoading } = useGetListAllLotes({
        ...filtrosAplicados,
        page: 1,
        limit: 100,
    });
    const { data: resumoPorCorData } = useGetResumoPorCor({
        ...filtrosAplicados,
        page: 1,
        limit: 100,
    });
    const dataLote = lotesData || [];

    const { mutate: deletarLote, isPending: isDeleting } = useDeletarLoteProducao();
    const { handleEditLoteCabeçalho, isSubmitting } = useProducaoActions();

    const { data: colaboradoresData } = useColaboradores();
    const [openCreateFormModal, setOpenCreateFormModal] = useState(false);
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ApiLoteProducaoResponse> | null>(null);

    const opcoesCor = useMemo(() => {
        const corMap = new Map<string, string>();

        (dataLote || []).forEach((lote) => {
            (lote.materiais || []).forEach((material) => {
                (material.cores || []).forEach((cor) => {
                    const corId = cor.corId || "";
                    const corNome = cor.nome || "";

                    if (!corId || corMap.has(corId)) return;
                    corMap.set(corId, corNome || corId);
                });
            });
        });

        return Array.from(corMap.entries()).map(([id, nome]) => ({ id, nome }));
    }, [dataLote]);

    const opcoesProduto = useMemo(() => {
        const produtoMap = new Map<string, string>();

        (dataLote || []).forEach((lote) => {
            (lote.materiais || []).forEach((material) => {
                (material.cores || []).forEach((cor) => {
                    (cor.gradeLote || []).forEach((grade) => {
                        const produtoId = grade.produtoId || "";
                        const produtoNome =
                            grade.produtoNome ||
                            grade.produto?.nome ||
                            "";

                        if (!produtoId || produtoMap.has(produtoId)) return;
                        produtoMap.set(produtoId, produtoNome || produtoId);
                    });
                });
            });
        });

        return Array.from(produtoMap.entries()).map(([id, nome]) => ({ id, nome }));
    }, [dataLote]);

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

    const updateFiltro = <K extends keyof IFiltrosFuncionaisLotes>(key: K, value: IFiltrosFuncionaisLotes[K]) => {
        setFiltros((prev) => ({
            ...prev,
            [key]: value,
        }));
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

                <div className="mb-6 rounded-lg border p-4">
                    <div className="mb-3 text-sm font-medium">Filtros</div>

                    <div className="w-full not-first:grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-7">
                        <div className="w-full space-y-1">
                            <Label>Status</Label>
                            <Select  value={filtros.status || "todos"} onValueChange={(value) => updateFiltro("status", value === "todos" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    {
                                        Object.entries(STATUS_LOTE_OPTIONS_FILTER).map(([statusKey, statusLabel]) => (
                                            <SelectItem key={statusKey} value={statusKey}>
                                                {statusLabel}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Codigo Lote</Label>
                            <Input
                                placeholder="Ex: LOTE-001"
                                value={filtros.codigoLote || ""}
                                onChange={(e) => updateFiltro("codigoLote", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Responsavel</Label>
                            <Select
                                value={filtros.responsavelId || "all"}
                                onValueChange={(value) => updateFiltro("responsavelId", value === "all" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {(colaboradoresData?.data || []).map((colaborador) => (
                                        <SelectItem key={colaborador.id} value={colaborador.id}>
                                            {colaborador.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Cor</Label>
                            <Select
                                value={filtros.corId || "all"}
                                onValueChange={(value) => updateFiltro("corId", value === "all" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {opcoesCor.map((cor) => (
                                        <SelectItem key={cor.id} value={cor.id}>
                                            {cor.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Produto</Label>
                            <Select
                                value={filtros.produtoId || "all"}
                                onValueChange={(value) => updateFiltro("produtoId", value === "all" ? "" : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {opcoesProduto.map((produto) => (
                                        <SelectItem key={produto.id} value={produto.id}>
                                            {produto.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Data Inicio</Label>
                            <Input
                                type="date"
                                value={filtros.dataInicio || ""}
                                onChange={(e) => updateFiltro("dataInicio", e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Data Fim</Label>
                            <Input
                                type="date"
                                value={filtros.dataFim || ""}
                                onChange={(e) => updateFiltro("dataFim", e.target.value)}
                            />
                        </div>

                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFiltros(initialFiltros);
                            }}
                        >
                            Limpar filtros
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
                    <ResumoGradePorCorTabs resumo={resumoPorCorData} />
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
