import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Package, Droplets, Search, X } from 'lucide-react';
import { ServerPagination } from '@/components/DataTable/TablePagination/server-pagination';
import { EstoqueCorteFiltros } from '@/hooks/queries/Estoque/useEstoque-Corte';
import { EstoqueCorte } from '@/types/EstoqueCorte';
import { PaginatedResponse } from '@/types/production';


export interface GroupedProduct {
    produtoNome: string;
    sku: string;
    cor: {
        id: string;
        nome: string;
        codigoHex: string;
    };
    tecido: string;
    loteCodigo: string;
    variacoes: Record<string, { nome: string; quantidade: number }>;
}

export type ProductVariation = {
    nome: string;
    quantidade: number;
};

interface InventoryDashboardContentProps {
    filters: EstoqueCorteFiltros;
    data: EstoqueCorte[];
    clearFilters: () => void
    filterOptions: {
        produtos: [string, string][];
        lotes: {
            id: string;
            codigoLote: string;
            tecido: {
                nome: string;
            };
        }[];
        cores: [string, string][];
        tamanhos: string[];
    };
    handleFilterChange: (key: keyof EstoqueCorteFiltros, value: string) => void;
    isLoading: boolean;
    groupedItems: GroupedProduct[];
    getSortedVariations: (item: GroupedProduct) => ProductVariation[]
    pagination: PaginatedResponse;
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSize: number;
}

const ALL_PRODUCTS = 'all-products';
const ALL_COLORS = 'all-colors';
const ALL_BATCHES = 'all-batches';

export const InventoryDashBoard = ({
    filters,
    data,
    clearFilters,
    filterOptions,
    handleFilterChange,
    isLoading,
    groupedItems,
    getSortedVariations,
    pagination,
    currentPage,
    onPageChange,
    pageSize,
}: InventoryDashboardContentProps) => {
    const [productSearch, setProductSearch] = useState('');
    const [colorSearch, setColorSearch] = useState('');
    const [batchSearch, setBatchSearch] = useState('');

    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return filterOptions.produtos;
        return filterOptions.produtos.filter(([, nome]) => nome.toLowerCase().includes(query));
    }, [filterOptions.produtos, productSearch]);

    const filteredColors = useMemo(() => {
        const query = colorSearch.trim().toLowerCase();
        if (!query) return filterOptions.cores;
        return filterOptions.cores.filter(([, nome]) => nome.toLowerCase().includes(query));
    }, [filterOptions.cores, colorSearch]);

    const filteredBatches = useMemo(() => {
        const query = batchSearch.trim().toLowerCase();
        if (!query) return filterOptions.lotes;
        return filterOptions.lotes.filter((lote) => lote.codigoLote.toLowerCase().includes(query));
    }, [filterOptions.lotes, batchSearch]);

    return (
        <main className="space-y-5 sm:space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Peças cortadas</h1>

                <Card className="w-full gap-3 py-3 sm:w-auto sm:py-4">
                    <CardContent className="flex items-center justify-between gap-4 px-4 sm:justify-start">
                        <div className="text-right">
                            <p className="text-xs uppercase text-muted-foreground">Total filtrado</p>
                            <p className="text-xl font-semibold text-foreground">
                                {data.reduce((acc, curr) => acc + curr.quantidadeDisponivel, 0)} <span className="text-xs text-muted-foreground">un</span>
                            </p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Package size={20} />
                        </div>
                    </CardContent>
                </Card>
            </header>

            <Card className="gap-4 py-4">
                <CardHeader className="px-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Search size={16} className="text-primary" /> Filtros
                        </div>
                        {(filters.produtoId || filters.corId || filters.loteProducaoId) && (
                            <Button onClick={clearFilters} variant="ghost" size="sm" className="h-auto px-0 text-xs text-destructive hover:text-destructive">
                                <X size={14} /> Limpar Filtros
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="px-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Produto</Label>
                            <Select
                                value={filters.produtoId || ALL_PRODUCTS}
                                onValueChange={(value) => handleFilterChange('produtoId', value === ALL_PRODUCTS ? '' : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos os Produtos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="sticky top-0 z-10 bg-popover p-2 border-b">
                                        <Input
                                            value={productSearch}
                                            onChange={(event) => setProductSearch(event.target.value)}
                                            onKeyDown={(event) => event.stopPropagation()}
                                            placeholder="Buscar produto..."
                                            className="h-8"
                                        />
                                    </div>
                                    <SelectItem value={ALL_PRODUCTS}>Todos os Produtos</SelectItem>
                                    {filteredProducts.map(([id, nome]) => (
                                        <SelectItem key={id} value={id}>{nome}</SelectItem>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <SelectItem value="no-product-results" disabled>Nenhum produto encontrado</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Cor</Label>
                            <Select
                                value={filters.corId || ALL_COLORS}
                                onValueChange={(value) => handleFilterChange('corId', value === ALL_COLORS ? '' : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todas as Cores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="sticky top-0 z-10 bg-popover p-2 border-b">
                                        <Input
                                            value={colorSearch}
                                            onChange={(event) => setColorSearch(event.target.value)}
                                            onKeyDown={(event) => event.stopPropagation()}
                                            placeholder="Buscar cor..."
                                            className="h-8"
                                        />
                                    </div>
                                    <SelectItem value={ALL_COLORS}>Todas as Cores</SelectItem>
                                    {filteredColors.map(([id, nome]) => (
                                        <SelectItem key={id} value={id}>{nome}</SelectItem>
                                    ))}
                                    {filteredColors.length === 0 && (
                                        <SelectItem value="no-color-results" disabled>Nenhuma cor encontrada</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Lote</Label>
                            <Select
                                value={filters.loteProducaoId || ALL_BATCHES}
                                onValueChange={(value) => handleFilterChange('loteProducaoId', value === ALL_BATCHES ? '' : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos os Lotes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="sticky top-0 z-10 bg-popover p-2 border-b">
                                        <Input
                                            value={batchSearch}
                                            onChange={(event) => setBatchSearch(event.target.value)}
                                            onKeyDown={(event) => event.stopPropagation()}
                                            placeholder="Buscar lote..."
                                            className="h-8"
                                        />
                                    </div>
                                    <SelectItem value={ALL_BATCHES}>Todos os Lotes</SelectItem>
                                    {filteredBatches.map((lote) => (
                                        <SelectItem key={lote.id} value={lote.id}>{lote.codigoLote}</SelectItem>
                                    ))}
                                    {filteredBatches.length === 0 && (
                                        <SelectItem value="no-batch-results" disabled>Nenhum lote encontrado</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <Card className="justify-center border-dashed py-0 shadow-none">
                            <CardContent className="flex items-center justify-center px-3 py-2 text-xs text-muted-foreground">
                                {isLoading ? 'Atualizando dados...' : `${pagination.total} resultados encontrados`}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
                {groupedItems.map((item, idx) => (
                    <Card key={`${item.sku}-${item.cor.id}-${idx}`} className="gap-0 overflow-hidden py-0">
                        <CardHeader className="px-4 py-5 sm:px-6 sm:py-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase text-primary">{item.sku}</span>
                                    <h2 className="mt-2 text-xl font-semibold text-foreground">{item.produtoNome}</h2>
                                    <p className="mt-1 text-xs text-muted-foreground">Lote {item.loteCodigo}</p>
                                </div>
                                <div className="h-10 w-10 rounded-md border border-border" style={{ backgroundColor: item.cor.codigoHex }} />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Droplets size={12} /> {item.tecido}</span>
                                <span className="font-medium text-foreground">{item.cor.nome}</span>
                            </div>
                        </CardHeader>

                        <CardContent className="mt-auto px-4 pb-5 sm:px-6 sm:pb-6">
                            <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/30 p-3 min-[420px]:grid-cols-2 sm:p-4">
                                {getSortedVariations(item).map((v) => (
                                    <div key={v.nome} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                                        <span className="font-semibold text-foreground">{v.nome}</span>
                                        <span className="font-mono text-sm font-semibold text-primary">{v.quantidade}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>

                        {/* <CardFooter className="border-t border-border p-0">
                            <Button className="h-11 w-full rounded-none" variant="secondary">
                                Iniciar Enfesto
                            </Button>
                        </CardFooter> */}
                    </Card>
                ))}
            </div>

            {pagination.total > 0 && (
                <ServerPagination
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    pageSize={pageSize}
                    isLoading={isLoading}
                />
            )}
        </main>
    )
}