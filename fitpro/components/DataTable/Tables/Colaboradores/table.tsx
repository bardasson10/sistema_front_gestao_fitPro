

"use client";

import React from "react";
import { Colaborador} from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getColaboradoresColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { ColaboradorProps } from "@/types/ColaboradorComponents/colaborador-component";

interface ColaboradorTableProps extends ColaboradorProps {

}

export const ColaboradorTable: React.FC<ColaboradorTableProps> = ({
  colaboradores,
  isLoading,
  onEdit,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getColaboradoresColumns(onEdit, onRemove),
    [onEdit, onRemove]
  );

  return (
    <div className="w-full">
      <SemDadosComponent<Colaborador> nomeDado="colaborador" data={colaboradores} />
      <DataTable
        columns={columns}
        data={colaboradores}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
      
    </div>
  );
};