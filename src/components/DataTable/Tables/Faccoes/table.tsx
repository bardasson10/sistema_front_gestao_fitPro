

"use client";

import React from "react";
import { Faccao } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getFaccoesColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";

import { FaccoesProps } from "@/types/FaccoesComponents/faccoes-component";

interface FaccoesTableProps extends FaccoesProps {

}

export const FaccoesTable: React.FC<FaccoesTableProps> = ({
  faccoes,
  isLoading,
  onEdit,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getFaccoesColumns(onEdit, onRemove),
    [onEdit, onRemove]
  );

  const data = Array.isArray(faccoes) ? faccoes : [];

  return (
    <div className="w-full">
      {data.length === 0 ? (
        <SemDadosComponent<Faccao> nomeDado="facção" data={data} />) :
        (<DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          getRowId={(row) => row.id}
        />)}

    </div>
  );
};