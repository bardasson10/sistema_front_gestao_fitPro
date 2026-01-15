"use client";

import React from "react";
import { Tecido } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getFabricColumns } from "./colums";
import { FabricProps } from "@/types/TecidoComponent/tecido-component";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";

interface FabricTableProps extends FabricProps {

}

export const FabricTable: React.FC<FabricTableProps> = ({
  tecido,
  isLoading,
  fornecedores,
  onEdit,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getFabricColumns(onEdit, onRemove, fornecedores),
    [onEdit, onRemove, fornecedores]
  );

  return (
    <div className="w-full">
      <SemDadosComponent<Tecido> nomeDado="tecido" data={tecido} />
      <DataTable
        columns={columns}
        data={tecido}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
      
    </div>
  );
};