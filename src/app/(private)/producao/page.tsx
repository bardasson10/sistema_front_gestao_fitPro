'use client'
import { CriarRemessaComponent } from "@/components/PageComponent/DirecionamentoProducao/criar-remessa-component";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { usePostCriarDirecionamentoProducaoInterna } from "@/hooks/queries/Direcionamento/useDirecionamento";
import { useGetEstoqueCorte } from "@/hooks/queries/Estoque/useEstoque-Corte";
import { useGetFaccoes } from "@/hooks/queries/Faccao/useFaccao";
import type { DirecionamentoRequestBodyPayload, DirecionamentoRemessa } from "@/types/Direcionamento";
import { PaginatedResponse } from "@/types/production";
import type { UseMutationResult } from "@tanstack/react-query";
import { Suspense } from "react"


const ProductionContent = () => {
    //estoque-certo
    const { data: estoqueCorte = [], refetch: refetchEstoqueCorte } = useGetEstoqueCorte({ limit: 10000 });
    const { data: faccoesData } = useGetFaccoes();

    const criarDirecionamentoProducaoInternaMutation = usePostCriarDirecionamentoProducaoInterna();

    const useNoopDirecionamentoRemessa = () => ({
        mutate: undefined,
        isPending: false,
    } as unknown as UseMutationResult<
        { data: DirecionamentoRemessa[]; pagination: PaginatedResponse },
        unknown,
        DirecionamentoRequestBodyPayload,
        unknown
    >);

    const handleRemessaCriada = async () => {
        await refetchEstoqueCorte();
    }

    return (
        <main>
            <CriarRemessaComponent
                dataFaccoes={faccoesData ?? []}
                dataEstoqueCorte={estoqueCorte}
                isProducaoInterna={true}
                usePostCriarDirecionamentoRemessa={useNoopDirecionamentoRemessa}
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