import React from "react";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockResume, StockResumeProps } from "@/types/StockComponents/stock-components"
import { DataTable } from "@/components/DataTable";
import { getGroupedStockColumns, getStockColumnsResume } from "./resume-colums";

interface ResumeStockTableProps extends StockResumeProps {

}

export const ResumeStockTable = ({ rolos, tecidos, isLoading }: ResumeStockTableProps) => {
  
  const resumoData = React.useMemo(
    () => getGroupedStockColumns(rolos, tecidos),
    [rolos, tecidos]
  );
  const columns = React.useMemo(
    () => getStockColumnsResume(),
    []
  );
  return (
    <div className="w-full" >
      <SemDadosComponent<StockResume> nomeDado="tecido" data={resumoData} />
      <DataTable
        columns={columns}
        data={resumoData}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
    </div>
  )
}