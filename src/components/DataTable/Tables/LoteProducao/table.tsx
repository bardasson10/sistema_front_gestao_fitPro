

"use client";

import React from "react";
import { DataTable } from "@/components/DataTable";
import { getLoteProducaoColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { LoteProducaoProps } from "@/types/LoteProduComponents/loteProducao-components";
import { LoteProducao } from "@/hooks/queries/useProducao";

interface LoteProducaoTableProps extends LoteProducaoProps {

}

export const LoteProducaoTable: React.FC<LoteProducaoTableProps> = ({
  lotesProducao,
  isLoading,
  onView,
}) => {
  const columns = React.useMemo(
    () => getLoteProducaoColumns(onView),
    [onView]
  );

  return (
    <div className="w-full">
      {
        !isLoading && lotesProducao.length === 0
      ?
        (<SemDadosComponent<LoteProducao> nomeDado="lote de produção" data={lotesProducao} />)
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