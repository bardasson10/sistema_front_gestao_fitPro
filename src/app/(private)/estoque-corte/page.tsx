'use client'
import { useState, useMemo, Suspense } from 'react';
import { useGetEstoqueCorte, EstoqueCorteFiltros, EstoqueCorteItem } from '@/hooks/queries/Estoque/useEstoque-Corte';
import { GroupedProduct, InventoryDashBoard, ProductVariation } from '@/components/PageComponent/estoque-corte/InventoryDashboardContent';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

const InventoryDashboardContent = () => {
    const [filters, setFilters] = useState<EstoqueCorteFiltros>({});

    const { data, isFetching } = useGetEstoqueCorte(filters);
    const typedData: EstoqueCorteItem[] = data;

    const filterOptions = useMemo(() => {
        return {
            produtos: Array.from(new Map(typedData.map(item => [item.produtoId, item.produto.nome])).entries()),
            lotes: Array.from(new Map(typedData.map(item => [item.lote.id, item.lote])).values()),
            cores: Array.from(new Map(typedData.map(item => [item.cor.id, item.cor.nome])).entries()),
            tamanhos: Array.from(new Set(typedData.map(item => item.tamanho.nome))).sort()
        };
    }, [typedData]);

    const groupedInventory = useMemo<Record<string, GroupedProduct>>(() => {
        return typedData.reduce<Record<string, GroupedProduct>>((acc, item) => {
            const groupKey = `${item.produtoId}-${item.cor.id}`;
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
            const tamanhoNome = item.tamanho.nome;
            if (acc[groupKey].variacoes[tamanhoNome]) {
                acc[groupKey].variacoes[tamanhoNome].quantidade += item.quantidadeDisponivel;
            } else {
                acc[groupKey].variacoes[tamanhoNome] = { nome: tamanhoNome, quantidade: item.quantidadeDisponivel };
            }
            return acc;
        }, {});
    }, [typedData]);

    const groupedItems = useMemo<GroupedProduct[]>(() => Object.values(groupedInventory), [groupedInventory]);

    const handleFilterChange = (key: keyof EstoqueCorteFiltros, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const clearFilters = () => setFilters({ limit: 1000 });

    const ordemTamanhos = ['P', 'M', 'G', 'GG'];

    const getSortedVariations = (item: GroupedProduct): ProductVariation[] => {
        return ordemTamanhos
            .map((tamanho) => item.variacoes[tamanho])
            .filter((variacao): variacao is ProductVariation => Boolean(variacao));
    };

    return (
        <InventoryDashBoard 
            filters={filters}
            data={typedData}
            clearFilters={clearFilters}
            filterOptions={filterOptions}
            handleFilterChange={handleFilterChange}
            isLoading={isFetching}
            groupedItems={groupedItems}
            getSortedVariations={getSortedVariations}
        />
    );
};

const InventoryDashboard = () => {
    return (
        <Suspense
            fallback={
                <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
                    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 text-center">
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