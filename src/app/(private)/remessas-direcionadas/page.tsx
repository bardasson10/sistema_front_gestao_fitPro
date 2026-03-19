'use client'
import { ListarRemessas } from '@/components/PageComponent/DirecionamentoProducao/listar/listar-remessas-component';
import { useGetDirecionamentos } from '@/hooks/queries/Direcionamento/useDirecionamento';
import { DirecionamentoRemessa } from '@/types/Direcionamento';
import { useState, useMemo, Suspense } from 'react';

const RemessasContent = () => {
  const { data: dataRemessas, isFetching: isFetchingRemessas } = useGetDirecionamentos();
  ;
  

  return (
    <>
    <ListarRemessas dataRemessas={dataRemessas}  />
    </>
  );
}


function RemessasDirecionadas() {

  return (
    <Suspense>
      <RemessasContent />
    </ Suspense>
  )
}

export default RemessasDirecionadas;