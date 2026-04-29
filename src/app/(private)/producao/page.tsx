'use client'
import { CriarRemessaProdInternaComponent } from "@/components/PageComponent/DirecionamentoProducao/criar-remessa-prodInterna";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { usePostCriarDirecionamentoProducaoInterna } from "@/hooks/queries/Direcionamento/useDirecionamento";
import { EstoqueCorteFiltros, useGetEstoqueCorte } from "@/hooks/queries/Estoque/useEstoque-Corte";
import { Suspense, useState } from "react"


const ProductionContent = () => {
    const [filters, setFilters] = useState<EstoqueCorteFiltros>({});

    //estoque-certo
    const { data: dataEstoqueCorte, isFetching: isFetchingEstoque, refetch: refetchEstoqueCorte } = useGetEstoqueCorte(filters);

    const criarDirecionamentoProducaoInternaMutation = usePostCriarDirecionamentoProducaoInterna();

    const handleRemessaCriada = async () => {
        await refetchEstoqueCorte();
    }

    return (
        <main>
            <CriarRemessaProdInternaComponent
                dataEstoqueCorte={dataEstoqueCorte}
                usePostCriarDirecionamentoProducaoInterna={() => criarDirecionamentoProducaoInternaMutation}
                onRemessaCriada={handleRemessaCriada}
            />
        </main>
    )

}


const ProductionPage = () => {
    return (
        <Suspense fallback={
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
        }>
            <ProductionContent />
        </Suspense>
    )
}

export default ProductionPage;