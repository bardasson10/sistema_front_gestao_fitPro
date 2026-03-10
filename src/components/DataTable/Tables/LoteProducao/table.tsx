

"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { getLoteProducaoColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { LoteProducaoProps } from "@/types/LoteProduComponents/loteProducao-components";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";

interface LoteProducaoTableProps extends LoteProducaoProps {

}

export const LoteProducaoTable: React.FC<LoteProducaoTableProps> = ({
  lotesProducao,
  isLoading,
  onView,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getLoteProducaoColumns(onView, onRemove),
    [onView, onRemove]
  );

  return (
    <div className="w-full">
      {
        !isLoading && lotesProducao.length === 0
      ?
        (<SemDadosComponent<ApiLoteProducaoResponse> nomeDado="lote de produção" data={lotesProducao} />)
      :
      (<DataTable
        columns={columns}
        data={lotesProducao}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />)
      }
      
    </div>
  );
};