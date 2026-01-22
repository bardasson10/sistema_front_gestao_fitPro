import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { RoloTecido } from "@/types/production"
import { StockProps } from "@/types/StockComponents/stock-components"
import React from "react";
import { getStockColumns } from "./colums";
import { DataTable } from "@/components/DataTable";

interface StockTableProps extends StockProps {

}

export const StockTable = ({ rolos, tecidos, isLoading, onEdit }: StockTableProps) => {
  const columns = React.useMemo(
    () => getStockColumns(onEdit!, tecidos),
    [tecidos, onEdit]
  );
  return (
    <div className="w-full" >
      <SemDadosComponent<RoloTecido> nomeDado="tecido" data={rolos} />
      <DataTable
        columns={columns}
        data={rolos}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
    </div>
  )
}