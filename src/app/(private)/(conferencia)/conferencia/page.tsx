'use client';

import { ListarConferencias } from "@/components/PageComponent/Conferencia/Listar/listar-conferencias-form";
import { RemessasProntasCard } from "@/components/PageComponent/Conferencia/Listar/components/remessas-prontas-card";
import { ConferenciasInternasCard } from "@/components/PageComponent/Conferencia/Listar/components/conferencias-internas-card";
import { useGetListAllConferencias } from "@/hooks/queries/Conferencia/useConferencia";
import { useGetRemessasProntas } from "@/hooks/queries/Direcionamento/useDirecionamento";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";


const CheckUpContent = () => {
  const { data: dataConferencias } = useGetListAllConferencias();
  const { data: dataRemessasProntas } = useGetRemessasProntas();

  const responseConferencias = dataConferencias?.data || [];
  const responseRemessasProntas = dataRemessasProntas?.data || [];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <RemessasProntasCard remessas={responseRemessasProntas} />
        <ListarConferencias dataConferencias={responseConferencias} />
        <ConferenciasInternasCard conferencias={responseConferencias} />
      </div>
    </main>
  );
}

const ConferenciaPageSkeleton = () => {
  return (
    <main className="flex flex-col gap-6">
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </main>
  );
};

function ConferenciaPage() {
  return (
    <Suspense fallback={<ConferenciaPageSkeleton />}>
      <CheckUpContent />
    </Suspense>
  )
}

export default ConferenciaPage;