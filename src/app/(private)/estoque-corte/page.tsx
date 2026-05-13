'use client'
import { useState, useMemo, Suspense } from 'react';
import { useGetEstoqueCortePaginado, EstoqueCorteFiltros } from '@/hooks/queries/Estoque/useEstoque-Corte';
import { GroupedProduct, InventoryDashBoard, ProductVariation } from '@/components/PageComponent/estoque-corte/InventoryDashboardContent';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CriarRemessaComponent } from '@/components/PageComponent/DirecionamentoProducao/criar-remessa-component';
import { EstoqueCorte } from '@/types/EstoqueCorte';
import { useGetFaccoes } from '@/hooks/queries/Faccao/useFaccao';
import { usePostCriarDirecionamentoProducaoInterna, usePostCriarDirecionamentoRemessa } from '@/hooks/queries/Direcionamento/useDirecionamento';
import { usePagination } from '@/hooks/use-pagination';

const InventoryDashboardContent = () => {

    const normalizeTamanhoNome = (nome: string) => nome.trim().toUpperCase();


    const [filters, setFilters] = useState<EstoqueCorteFiltros>({
        limit: 10000,
    });
    const [activeTab, setActiveTab] = useState<'estoque' | 'remessa'>('estoque');

    const {
        page,
        limit: pageSize,
        setPage,
        setPageSize,
    } = usePagination();

    const queryFilters = useMemo(() => ({
        ...filters,
        page,
        limit: pageSize,
    }), [filters, page, pageSize]);

    const { data: dataEstoqueCorte, isFetching: isFetchingEstoque, refetch: refetchEstoqueCorte } = useGetEstoqueCortePaginado(queryFilters);
    const typedData: EstoqueCorte[] = dataEstoqueCorte?.data || [];
    const pagination = dataEstoqueCorte?.pagination || {
        total: 0,
        pages: 1,
        page,
        limit: pageSize,
    };

    const filterOptions = useMemo(() => {
        return {
            produtos: Array.from(new Map(typedData.map(item => [item.produto.id, item.produto.nome])).entries()),
            lotes: Array.from(new Map(typedData.map(item => [item.lote.id, item.lote])).values()),
            cores: Array.from(new Map(typedData.map(item => [item.cor.id, item.cor.nome])).entries()),
            tamanhos: Array.from(new Set(typedData.map(item => normalizeTamanhoNome(item.tamanho.nome)))).sort()
        };
    }, [typedData]);

    const groupedInventory = useMemo<Record<string, GroupedProduct>>(() => {
        return typedData.reduce<Record<string, GroupedProduct>>((acc, item) => {
            const groupKey = `${item.produto.id}-${item.cor.id}-${item.lote.id}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    produtoNome: item.produto.nome,
                    sku: item.produto.sku,
                    cor: item.cor,
                    tecido: item.lote.tecido.nome,
                    loteCodigo: item.lote.codigoLote,
                    variacoes: {}
                };
            }
            const tamanhoNomeOriginal = item.tamanho.nome?.trim() || item.tamanho.nome;
            const tamanhoNome = normalizeTamanhoNome(tamanhoNomeOriginal || "");

            if (acc[groupKey].variacoes[tamanhoNome]) {
                acc[groupKey].variacoes[tamanhoNome].quantidade += item.quantidadeDisponivel;
            } else {
                acc[groupKey].variacoes[tamanhoNome] = {
                    nome: tamanhoNomeOriginal || tamanhoNome,
                    quantidade: item.quantidadeDisponivel,
                };
            }
            return acc;
        }, {});
    }, [typedData]);

    const groupedItems = useMemo<GroupedProduct[]>(() => Object.values(groupedInventory), [groupedInventory]);

    const handleFilterChange = (key: keyof EstoqueCorteFiltros, value: string) => {
        setPage(1);
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const clearFilters = () => {
        setPage(1);
        setFilters({ limit: 10000 });
    };

    const ordemTamanhos = ['P', 'M', 'G', 'GG'];

    const getSortedVariations = (item: GroupedProduct): ProductVariation[] => {
        const variacoesOrdenadas = ordemTamanhos
            .map((tamanho) => item.variacoes[normalizeTamanhoNome(tamanho)])
            .filter((variacao): variacao is ProductVariation => Boolean(variacao));

        const variacoesExtras = Object.entries(item.variacoes)
            .filter(([tamanho]) => !ordemTamanhos.includes(normalizeTamanhoNome(tamanho)))
            .map(([, variacao]) => variacao);

        return [...variacoesOrdenadas, ...variacoesExtras];
    };

    //Faccao
    const { data: dataFaccoes, isFetching: isFetchingFaccoes } = useGetFaccoes();

    //Remessa
    const criarDirecionamentoRemessaMutation = usePostCriarDirecionamentoRemessa();
    const criarDirecionamentoProducaoInternaMutation = usePostCriarDirecionamentoProducaoInterna();

    const handleRemessaCriada = async () => {
        await refetchEstoqueCorte();
        setActiveTab('remessa');
    }

    


    return (
        <main>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'estoque' | 'remessa')} className="w-full">
                <div className="  gap-3 mb-6 sm:flex-row sm:justify-between sm:items-center">

                    <TabsList className="w-full  h-auto sm:w-auto sm:flex-row sm:h-10">
                        <TabsTrigger value="estoque" className="w-full justify-center sm:w-auto text-xs sm:text-sm">
                            Estoque 
                        </TabsTrigger>
                        <TabsTrigger value="remessa" className="w-full justify-center sm:w-auto text-xs sm:text-sm">
                            Remessa
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="estoque">
                        <InventoryDashBoard
                            filters={filters}
                            data={typedData}
                            clearFilters={clearFilters}
                            filterOptions={filterOptions}
                            handleFilterChange={handleFilterChange}
                            isLoading={isFetchingEstoque}
                            groupedItems={groupedItems}
                            getSortedVariations={getSortedVariations}
                            pagination={{
                                total: pagination.total,
                                pages: pagination.pages,
                                page,
                                limit: pageSize,
                            }}
                            currentPage={page}
                            onPageChange={setPage}
                            pageSize={pageSize}
                            
                        />
                    </TabsContent>

                    <TabsContent value="remessa">
                        <CriarRemessaComponent 
                        dataFaccoes={dataFaccoes ?? []} 
                        dataEstoqueCorte={typedData} 
                        usePostCriarDirecionamentoRemessa={() => criarDirecionamentoRemessaMutation}
                        usePostCriarDirecionamentoProducaoInterna={() => criarDirecionamentoProducaoInternaMutation}
                        onRemessaCriada={handleRemessaCriada}
                        />
                    </TabsContent>

                </div>
            </Tabs>
        </main>

    );
};




const InventoryDashboard = () => {
    return (
        <Suspense
            fallback={
                <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
                    <div className="flex min-h-45 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 text-center">
                        <Spinner className="size-6 text-primary" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Carregando estoque de corte</p>
                            <p className="text-xs text-muted-foreground">Buscando dados e aplicando filtros iniciais...</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="space-y-4 rounded-lg border border-border bg-card p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="w-full space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-6 w-44" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-md" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                                <div className="grid grid-cols-2 gap-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <InventoryDashboardContent />
        </Suspense>
    );
};

export default InventoryDashboard;