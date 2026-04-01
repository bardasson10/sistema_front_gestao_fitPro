'use client'
import { ListarRemessas } from '@/components/PageComponent/DirecionamentoProducao/listar/listar-remessas-component';
import { useGetDirecionamentos } from '@/hooks/queries/Direcionamento/useDirecionamento';
import { usePagination } from '@/hooks/use-pagination';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RemessasSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-5 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-44" />
          <Skeleton className="h-10 w-full sm:w-44" />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

const RemessasContent = () => {
  const pagination = usePagination({ initialPage: 1, initialLimit: 10 });
  const { data: responseRemessas } = useGetDirecionamentos({
    page: pagination.page,
    limit: pagination.limit,
  });

  const dataRemessas = responseRemessas?.data ?? [];
  const serverPagination = responseRemessas?.pagination;

  const currentPage = serverPagination?.page ?? pagination.currentPage;
  const totalPages = serverPagination?.pages ?? pagination.totalPages;
  const totalItems = serverPagination?.total ?? dataRemessas.length;
  

  return (
    <>
    <ListarRemessas
      dataRemessas={dataRemessas}
      page={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      limit={pagination.limit}
      onPageChange={pagination.goToPage}
      onLimitChange={pagination.setPageSize}
    />
    </>
  );
}


function RemessasDirecionadas() {

  return (
    <Suspense fallback={<RemessasSkeleton />}>
      <RemessasContent />
    </Suspense>
  )
}

export default RemessasDirecionadas;