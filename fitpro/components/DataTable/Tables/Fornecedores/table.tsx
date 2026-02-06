

"use client";

import React from "react";
import { Fornecedor } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getFornecedoresColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { FornecedorProps } from "@/types/FornecedoresComponents/fornecedor-component";

interface FornecedorTableProps extends FornecedorProps {

}

export const FornecedorTable: React.FC<FornecedorTableProps> = ({
  fornecedores,
  isLoading,
  onEdit,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getFornecedoresColumns(onEdit, onRemove),
    [onEdit, onRemove]
  );

  return (
    <div className="w-full">
      {fornecedores.length === 0 ? (
        <SemDadosComponent<Fornecedor> nomeDado="fornecedor" data={fornecedores} />
      ) : (
        <DataTable
          columns={columns}
          data={fornecedores}
          isLoading={isLoading}
          getRowId={(row) => row.id}
        />)}
    </div>
  );
};