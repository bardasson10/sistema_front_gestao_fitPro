'use client';

import { ListarConferencias } from "@/components/PageComponent/Conferencia/Listar/listar-conferencias-form";
import { useGetListAllConferencias } from "@/hooks/queries/Conferencia/useConferencia";
import { Suspense } from "react";


const CheckUpContent = () => {
  const { data: dataConferencias } = useGetListAllConferencias();
  return (
    <main>
    <ListarConferencias dataConferencias={dataConferencias || []} />
    </main>
  );
}

function ConferenciaPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckUpContent />
    </Suspense>
  )
}

export default ConferenciaPage;