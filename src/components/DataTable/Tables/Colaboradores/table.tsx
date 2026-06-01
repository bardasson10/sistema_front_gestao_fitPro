

"use client";

import React from "react";
import { Colaborador } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getColaboradoresColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { ColaboradorProps } from "@/types/ColaboradorComponents/colaborador-component";
import { ServerPagination } from "@/components/DataTable/TablePagination/server-pagination";

interface ColaboradorTableProps extends ColaboradorProps {

}

export const ColaboradorTable: React.FC<ColaboradorTableProps> = ({
  colaboradores,
  isLoading,
  onEdit,
  onRemove,
  pagination,
  currentPage = 1,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  const columns = React.useMemo(
    () => getColaboradoresColumns(onEdit, onRemove),
    [onEdit, onRemove]
  );

  const data = Array.isArray(colaboradores) ? colaboradores : [];
  return (
    <div className="w-full">
      {
        data.length === 0 ?
          (<SemDadosComponent<Colaborador> nomeDado="colaborador" data={colaboradores} />) 
          :
          (<div className="border rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={colaboradores}
              isLoading={isLoading}
              getRowId={(row) => row.id}
              
            />
            {pagination && onPageChange && (
              <ServerPagination
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={onPageChange}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                isLoading={isLoading}
              />
            )}
          </div>)
          }

    </div>
  );
};