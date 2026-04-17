"use client";

import React from "react";
import { Tecido, PaginatedResponse } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { ServerPagination } from "@/components/DataTable/TablePagination/server-pagination";
import { getFabricColumns } from "./colums";
import { FabricProps } from "@/types/TecidoComponent/tecido-component";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";

interface FabricTableProps extends FabricProps {
  pagination?: PaginatedResponse;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

export const FabricTable: React.FC<FabricTableProps> = ({
  tecidos,
  isLoading,
  fornecedores,
  cores,
  onEdit,
  onRemove,
  pagination,
  currentPage = 1,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) => {
  const columns = React.useMemo(
    () => getFabricColumns(onEdit, onRemove, fornecedores, cores),
    [onEdit, onRemove, fornecedores, cores]
  );

  const data = Array.isArray(tecidos) ? tecidos : [];

  return (
    <div className="w-full">
      {data.length === 0 ? (
        <SemDadosComponent<Tecido> nomeDado="tecido" data={data} />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            showPagination={false}
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
        </div>
      )}
    </div>
  );
};