'use client';

import { ListarConferencias } from "@/components/PageComponent/Conferencia/Listar/listar-conferencias-form";
import { ConferenciasInternasCard } from "@/components/PageComponent/Conferencia/Listar/components/conferencias-internas-card";
import { ConferenciasExternasCard } from "@/components/PageComponent/Conferencia/Listar/components/conferencias-externas-card";
import { useGetListAllConferencias, useGetListAllConferenciasApproved } from "@/hooks/queries/Conferencia/useConferencia";
import { useGetRemessasProntas } from "@/hooks/queries/Direcionamento/useDirecionamento";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { ConferenciasAprodParcialCard } from "@/components/PageComponent/Conferencia/Listar/components/conferencias-aprodParcial-card";


const CheckUpContent = () => {
  const { data: dataConferenciasAprovadas } = useGetListAllConferenciasApproved();
  const { data: dataConferencias } = useGetListAllConferencias();
  const { data: dataConferenciasAprodParcial } = useGetListAllConferencias({ statusQualidade: 'aprovado_parcial' });
  const { data: dataRemessasProntas } = useGetRemessasProntas();

  const responseConferencias = dataConferencias?.data || [];
  const responseRemessasProntas = dataRemessasProntas?.data || [];
  const responseConferenciasAprovadas = dataConferenciasAprovadas?.data || [];
  const responseConferenciasAprodParcial = dataConferenciasAprodParcial?.data || [];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <ListarConferencias dataConferencias={responseConferencias} responseRemessasProntas={responseRemessasProntas} />
        <ConferenciasAprodParcialCard conferencias={responseConferenciasAprodParcial} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ConferenciasInternasCard conferencias={responseConferencias} />
          <ConferenciasExternasCard conferencias={responseConferenciasAprovadas} />
        </div>
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