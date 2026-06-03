import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockProps } from "@/types/StockComponents/stock-components"
import React from "react";
import { getStockColumns } from "./colums";
import { DataTable } from "@/components/DataTable";
import { EstoqueRolo } from "@/types/EstoqueRolo";
import { ServerPagination } from "../../TablePagination/server-pagination";
import { PaginationState } from "@tanstack/react-table";


interface StockTableProps extends StockProps {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  pageCount: number;
}

export const StockTable = ({
  rolos,
  tecidos,
  cores,
  isLoading,
  onEdit,
  onRemove,
  canDelete = false,
  pagination,
  setPagination,
  pageCount,
}: StockTableProps) => {
  const columns = React.useMemo(
    () => getStockColumns(onEdit, onRemove, canDelete, tecidos, cores),
    [tecidos, onEdit, onRemove, canDelete, cores]);
  const data = Array.isArray(rolos) ? rolos : [];
  return (
    <div className="w-full" >
      {data.length === 0 ? (<SemDadosComponent<EstoqueRolo> nomeDado="tecido" data={rolos} />)
        :
        (<div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            getRowId={(row) => row.id}
            pagination={pagination}
            setPagination={setPagination}
            pageCount={pageCount}
            manualPagination={true}
          />
        </div>)}
    </div>
  )
}