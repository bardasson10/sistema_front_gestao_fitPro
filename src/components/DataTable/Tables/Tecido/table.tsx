"use client";

import React from "react";
import { Tecido } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getFabricColumns } from "./colums";
import { FabricProps } from "@/types/TecidoComponent/tecido-component";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { core } from "zod";
import { da } from "zod/v4/locales";

interface FabricTableProps extends FabricProps {

}

export const FabricTable: React.FC<FabricTableProps> = ({
  tecidos,
  isLoading,
  fornecedores,
  cores,
  onEdit,
  onRemove,
}) => {
  const columns = React.useMemo(
    () => getFabricColumns(onEdit, onRemove, fornecedores, cores),
    [onEdit, onRemove, fornecedores, cores]
  );

  const data = Array.isArray(tecidos) ? tecidos : [];

  return (
    <div className="w-full">
      {data.length === 0 ?
        (<SemDadosComponent<Tecido> nomeDado="tecido" data={data} />) :
        (<DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          getRowId={(row) => row.id}
        />)}

    </div>
  );
};