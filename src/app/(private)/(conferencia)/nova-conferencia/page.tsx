'use client';

import { Suspense } from "react";
import { CriarConferenciaForm } from "@/components/PageComponent/Conferencia/criar-conferencia-form";
import { useGetDirecionamentos } from "@/hooks/queries/Direcionamento/useDirecionamento";
import { useColaboradores } from "@/hooks/queries/useColaboradores";
import { usePostCriarConferencia } from "@/hooks/queries/Conferencia/useConferencia";


const NewCheckUpContent = () => {
  const { data: dataRemessas, isFetching: isFetchingRemessas } = useGetDirecionamentos();
  const { data: colaboradoresData, isLoading } = useColaboradores();
  const { mutate: criarConferencia, isPending } = usePostCriarConferencia();

  return (
    <main>
      <CriarConferenciaForm
        dataRemessas={dataRemessas || []}
        dataResponsaveis={colaboradoresData?.data || []}
        criarConferencia={criarConferencia}
        isPending={isPending}
      />
    </main>
  );
}

function NovaConferenciaPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NewCheckUpContent />
    </Suspense>
  )
}

export default NovaConferenciaPage;