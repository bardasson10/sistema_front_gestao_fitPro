'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CriarConferenciaForm } from '@/components/PageComponent/Conferencia/criar-conferencia-form';
import { useGetDirecionamento } from '@/hooks/queries/Direcionamento/useDirecionamento';
import { useColaboradores } from '@/hooks/queries/useColaboradores';
import { usePostCriarConferencia } from '@/hooks/queries/Conferencia/useConferencia';
import { Skeleton } from '@/components/ui/skeleton';

const NewCheckUpByIdContent = () => {
    const params = useParams<{ id: string }>();
    const remessaId = typeof params?.id === 'string' ? params.id : '';

    const { data: remessa } = useGetDirecionamento(remessaId);
    const { data: colaboradoresData } = useColaboradores();
    const { mutate: criarConferencia, isPending } = usePostCriarConferencia();

    return (
        <main>
            <CriarConferenciaForm
                dataRemessas={remessa ? [remessa] : []}
                dataResponsaveis={colaboradoresData?.data || []}
                criarConferencia={criarConferencia}
                isPending={isPending}
                initialRemessaId={remessaId || undefined}
            />
        </main>
    );
};

const NovaConferenciaByIdSkeleton = () => {
    return (
        <main className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-5 w-80" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-lg border p-4 space-y-3 lg:col-span-2">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </main>
    );
};

function NovaConferenciaByIdPage() {
    return (
        <Suspense fallback={<NovaConferenciaByIdSkeleton />}>
            <NewCheckUpByIdContent />
        </Suspense>
    );
}

export default NovaConferenciaByIdPage;
