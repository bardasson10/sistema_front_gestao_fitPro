'use client';

import { LoteProducaoTable } from "@/components/DataTable/Tables/LoteProducao/table";

import { RemoveItemWarning } from "@/components/ErrorManagementComponent/WarnningRemoveItem";
import { LoteProducaoAccordionForm } from "@/components/Forms/LoteProducao/accordion-lote-form";
import { CreateLoteForm } from "@/components/Forms/LoteProducao/subForms/createLoteForm";
import { MobileViewLoteProducao } from "@/components/MobileViewCards/LoteProducaoCard";
import { BaseModal } from "@/components/Modal/base-modal";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
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
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { ILoteResponse } from "@/types/Lote";
import { IFiltrosLote, useGetListAllLotes, useGetResumoPorCor } from "@/hooks/queries/Lote/useLote";
import { ResumoGradePorCorTabs } from "@/components/DataTable/Tables/LoteProducao/resumo-grade-por-cor-tabs";

type IFiltroLoteKey = "status" | "codigoLote" | "responsavelId" | "corId" | "produtoId" | "dataInicio" | "dataFim";
type IFiltrosFuncionaisLotes = Record<IFiltroLoteKey, string[]>;

interface IMultiSelectOption {
    id: string;
    nome: string;
}

interface MultiSelectFilterProps {
    label: string;
    placeholder: string;
    options: IMultiSelectOption[];
    selectedValues: string[];
    allLabel?: string;
    onToggle: (value: string) => void;
    onClear: () => void;
}

function MultiSelectFilter({
    label,
    placeholder,
    options,
    selectedValues,
    allLabel = "Todos",
    onToggle,
    onClear,
}: MultiSelectFilterProps) {
    const selectedLabels = options
        .filter((option) => selectedValues.includes(option.id))
        .map((option) => option.nome);

    const buttonText = selectedLabels.length === 0
        ? allLabel
        : selectedLabels.length <= 2
            ? selectedLabels.join(", ")
            : `${selectedLabels.length} selecionados`;

    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between font-normal">
                        <span className="truncate text-left">{buttonText}</span>
                        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-52">
                    <DropdownMenuCheckboxItem
                        checked={selectedValues.length === 0}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={() => onClear()}
                    >
                        {allLabel}
                    </DropdownMenuCheckboxItem>

                    {options.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma opção disponível</div>
                    )}

                    {options.map((option) => (
                        <DropdownMenuCheckboxItem
                            key={option.id}
                            checked={selectedValues.includes(option.id)}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={() => onToggle(option.id)}
                        >
                            {option.nome}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

const initialFiltros: IFiltrosFuncionaisLotes = {
    status: [],
    codigoLote: [],
    responsavelId: [],
    corId: [],
    produtoId: [],
    dataInicio: [],
    dataFim: [],
};

export default function Lotes() {
    const [filtrosRascunho, setFiltrosRascunho] = useState<IFiltrosFuncionaisLotes>(initialFiltros);
    const [filtrosAplicados, setFiltrosAplicados] = useState<IFiltrosFuncionaisLotes>(initialFiltros);
    const [resumoPage, setResumoPage] = useState(1);
    const [resumoLimit, setResumoLimit] = useState(10);

    const filtrosParaQuery = useMemo<Partial<IFiltrosLote>>(() => ({
        status: filtrosAplicados.status.length ? filtrosAplicados.status : undefined,
        codigoLote: filtrosAplicados.codigoLote.length ? filtrosAplicados.codigoLote : undefined,
        responsavelId: filtrosAplicados.responsavelId.length ? filtrosAplicados.responsavelId : undefined,
        corId: filtrosAplicados.corId.length ? filtrosAplicados.corId : undefined,
        produtoId: filtrosAplicados.produtoId.length ? filtrosAplicados.produtoId : undefined,
        dataInicio: filtrosAplicados.dataInicio.length ? filtrosAplicados.dataInicio : undefined,
        dataFim: filtrosAplicados.dataFim.length ? filtrosAplicados.dataFim : undefined,
    }), [filtrosAplicados]);

    const lotesListQuery = useMemo(() => ({
        ...filtrosParaQuery,
        page: 1,
        limit: 300,
    }), [filtrosParaQuery]);

    const resumoQuery = useMemo(() => ({
        ...filtrosParaQuery,
        page: resumoPage,
        limit: resumoLimit,
    }), [filtrosParaQuery, resumoPage, resumoLimit]);

    const { data: lotesData, isPending: isLoadingLotes } = useGetListAllLotes(lotesListQuery);
    const { data: resumoPorCorData, isPending: isLoadingResumo } = useGetResumoPorCor(resumoQuery);
    const dataLote = lotesData || [];
    const sourceOptionsLote = dataLote;

    const { mutate: deletarLote, isPending: isDeleting } = useDeletarLoteProducao();
    const { handleEditLoteCabeçalho, isSubmitting } = useProducaoActions();

    const { data: colaboradoresData } = useColaboradores();
    const [openCreateFormModal, setOpenCreateFormModal] = useState(false);
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ApiLoteProducaoResponse> | null>(null);

    const opcoesCor = useMemo(() => {
        const corMap = new Map<string, string>();

        (sourceOptionsLote || []).forEach((lote) => {
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
    }, [sourceOptionsLote]);

    const opcoesProduto = useMemo(() => {
        const produtoMap = new Map<string, string>();

        (sourceOptionsLote || []).forEach((lote) => {
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
    }, [sourceOptionsLote]);

    const opcoesResponsavel = useMemo(
        () => (colaboradoresData?.data || []).map((colaborador) => ({
            id: colaborador.id,
            nome: colaborador.nome,
        })),
        [colaboradoresData?.data],
    );

    const opcoesCodigoLote = useMemo(() => {
        const codigoMap = new Map<string, string>();

        sourceOptionsLote.forEach((lote) => {
            const codigo = lote.codigoLote || "";
            if (!codigo || codigoMap.has(codigo)) return;
            codigoMap.set(codigo, codigo);
        });

        return Array.from(codigoMap.entries()).map(([id, nome]) => ({ id, nome }));
    }, [sourceOptionsLote]);

    const opcoesDatas = useMemo(() => {
        const dateMap = new Map<string, string>();

        sourceOptionsLote.forEach((lote) => {
            if (!lote.createdAt) return;
            const dateOnly = lote.createdAt.slice(0, 10);
            if (!dateOnly || dateMap.has(dateOnly)) return;

            const prettyDate = new Date(`${dateOnly}T00:00:00`).toLocaleDateString("pt-BR");
            dateMap.set(dateOnly, prettyDate);
        });

        return Array.from(dateMap.entries())
            .map(([id, nome]) => ({ id, nome }))
            .sort((a, b) => a.id.localeCompare(b.id));
    }, [sourceOptionsLote]);

    const form = useForm<LoteProducaoFormValues>({
        resolver: zodResolver(loteProducaoFormSchema),
        defaultValues: initialValuesLote,
    });

    const mapLoteToFormValues = (item: Partial<ApiLoteProducaoResponse>): LoteProducaoFormValues => ({
        ...initialValuesLote,
        id: item.id ?? initialValuesLote.id,
        codigoLote: item.codigoLote ?? initialValuesLote.codigoLote,
        tecidoId: item.tecidoId ?? initialValuesLote.tecidoId,
        status: item.status ?? initialValuesLote.status as any,
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
                    valorTecido: Number(cor.valorTecido || 0),
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
            status: direcionamento.status as any,
            dataPrevisaoRetorno: direcionamento.dataPrevisaoRetorno || "",
        })),
    });

    const selectedLote = editingItem
        ? dataLote.find((l) => l.id === editingItem.id) ?? (editingItem as ILoteResponse)
        : null;

    const handleEdit = (item: ApiLoteProducaoResponse) => {
        setEditingItem(item);
        form.reset(mapLoteToFormValues(item));
    };

    const handleRemove = (id: string) => {
        setRemovingItemId(id);
        setIsRemoveOpen(true);
    };

    const [histDateFilter, setHistDateFilter] = useState('');
    const [histCodigoFilter, setHistCodigoFilter] = useState('');

    const updateFiltro = (key: IFiltroLoteKey, value: string[]) => {
        setFiltrosRascunho((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleFiltro = (key: IFiltroLoteKey, value: string) => {
        setFiltrosRascunho((prev) => {
            const current = prev[key];
            const updated = current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value];

            return {
                ...prev,
                [key]: updated,
            };
        });
    };

    const lotesPrincipais = useMemo(
        () => dataLote.filter((lote) => lote.status !== "cortado"),
        [dataLote],
    );

    const lotesCortados = useMemo(
        () => dataLote.filter((lote) => lote.status === "cortado"),
        [dataLote],
    );

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
                        <MultiSelectFilter
                            label="Codigo Lote"
                            placeholder="Selecione"
                            options={opcoesCodigoLote}
                            selectedValues={filtrosRascunho.codigoLote}
                            onToggle={(value) => toggleFiltro("codigoLote", value)}
                            onClear={() => updateFiltro("codigoLote", [])}
                        />

                        <MultiSelectFilter
                            label="Responsável"
                            placeholder="Selecione"
                            options={opcoesResponsavel}
                            selectedValues={filtrosRascunho.responsavelId}
                            onToggle={(value) => toggleFiltro("responsavelId", value)}
                            onClear={() => updateFiltro("responsavelId", [])}
                        />

                        <MultiSelectFilter
                            label="Cor"
                            placeholder="Selecione"
                            options={opcoesCor}
                            selectedValues={filtrosRascunho.corId}
                            onToggle={(value) => toggleFiltro("corId", value)}
                            onClear={() => updateFiltro("corId", [])}
                        />

                        <MultiSelectFilter
                            label="Produto"
                            placeholder="Selecione"
                            options={opcoesProduto}
                            selectedValues={filtrosRascunho.produtoId}
                            onToggle={(value) => toggleFiltro("produtoId", value)}
                            onClear={() => updateFiltro("produtoId", [])}
                        />

                        <MultiSelectFilter
                            label="Data Inicio"
                            placeholder="Selecione"
                            options={opcoesDatas}
                            selectedValues={filtrosRascunho.dataInicio}
                            onToggle={(value) => toggleFiltro("dataInicio", value)}
                            onClear={() => updateFiltro("dataInicio", [])}
                        />

                        <MultiSelectFilter
                            label="Data Fim"
                            placeholder="Selecione"
                            options={opcoesDatas}
                            selectedValues={filtrosRascunho.dataFim}
                            onToggle={(value) => toggleFiltro("dataFim", value)}
                            onClear={() => updateFiltro("dataFim", [])}
                        />

                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFiltrosRascunho(initialFiltros);
                                setFiltrosAplicados(initialFiltros);
                                setResumoPage(1);
                            }}
                        >
                            Limpar filtros
                        </Button>

                        <Button
                            type="button"
                            onClick={() => {
                                setFiltrosAplicados(filtrosRascunho);
                                setResumoPage(1);
                            }}
                        >
                            Aplicar filtros
                        </Button>
                    </div>
                </div>

                <TabsContent value="lotes-cadastrados">
                    <div className="hidden md:block">
                        <LoteProducaoTable
                            lotesProducao={lotesPrincipais}
                            isLoading={isLoadingLotes || isDeleting}
                            onView={handleEdit}
                            onRemove={handleRemove}
                        />
                    </div>

                    <div className="block md:hidden">
                        <MobileViewLoteProducao
                            lotesProducao={lotesPrincipais}
                            isLoading={isLoadingLotes || isDeleting}
                            onView={handleEdit}
                            onRemove={handleRemove}
                        />
                    </div>

                    {/* Histórico de lotes cortados */}
                    {lotesCortados.length > 0 && (
                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Histórico — Lotes Cortados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        if (lotesCortados.length === 0) {
                                            return <div className="text-sm text-muted-foreground">Nenhum lote cortado encontrado.</div>;
                                        }

                                        const cortadosFiltered = lotesCortados.filter(l => {
                                            const dateOnly = l.createdAt ? l.createdAt.slice(0, 10) : '';
                                            if (histDateFilter && dateOnly !== histDateFilter) return false;
                                            if (histCodigoFilter && l.codigoLote !== histCodigoFilter) return false;
                                            return true;
                                        });

                                        const grouped = cortadosFiltered.reduce<Record<string, typeof cortadosFiltered>>((acc, lote) => {
                                            const dateOnly = lote.createdAt ? lote.createdAt.slice(0, 10) : 'Sem data';
                                            acc[dateOnly] = acc[dateOnly] || [];
                                            acc[dateOnly].push(lote);
                                            return acc;
                                        }, {});

                                        const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

                                        return (
                                            <div>
                                                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-sm">Data</Label>
                                                        <Select value={histDateFilter || '__all__'} onValueChange={(v) => setHistDateFilter(v === '__all__' ? '' : v)}>
                                                            <SelectTrigger className="w-full"><SelectValue placeholder="Filtrar por data" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="__all__">Todos</SelectItem>
                                                                {opcoesDatas.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm">Código do Lote</Label>
                                                        <Select value={histCodigoFilter || '__all__'} onValueChange={(v) => setHistCodigoFilter(v === '__all__' ? '' : v)}>
                                                            <SelectTrigger className="w-full"><SelectValue placeholder="Filtrar por código do lote" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="__all__">Todos</SelectItem>
                                                                {opcoesCodigoLote.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {dates.map(date => (
                                                    <div key={date} className="mb-6">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <h4 className="text-sm font-medium">{new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')}</h4>
                                                            <span className="text-xs text-muted-foreground">{grouped[date].length} lote(s)</span>
                                                        </div>

                                                        <LoteProducaoTable
                                                            lotesProducao={grouped[date]}
                                                            isLoading={isLoadingLotes || isDeleting}
                                                            onView={handleEdit}
                                                            onRemove={handleRemove}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="resumo-grade-por-cor">
                    <ResumoGradePorCorTabs
                        resumo={resumoPorCorData?.resumo}
                        pagination={resumoPorCorData?.pagination}
                        isLoading={isLoadingResumo}
                        onPageChange={setResumoPage}
                        onLimitChange={(newLimit) => {
                            setResumoLimit(newLimit);
                            setResumoPage(1);
                        }}
                    />
                </TabsContent>
            </Tabs>

            <BaseModal
                title="Criar Novo Lote"
                open={openCreateFormModal}
                onOpenChange={setOpenCreateFormModal}
                description="Aqui você cria um novo lote"
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
                description="Aqui você edita um lote existente"
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
