import React from "react";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { StockMovimentacao } from "@/types/StockComponents/stock-components"
import { DataTable } from "@/components/DataTable";
import { getStockMovementColumns } from "./columns"
import { IMovimentacaoRolo } from "@/types/EstoqueRolo";

interface MovementStockTableProps extends StockMovimentacao {

}

export const MovementStockTable = ({ movimentacoes, rolos, cores, tecidos, isLoading }: MovementStockTableProps) => {

    const columns = React.useMemo(
        () => getStockMovementColumns(rolos, tecidos, cores),
        [rolos, tecidos, cores]
    );

    const data = Array.isArray(movimentacoes) ? movimentacoes : [];


    return (
        <div className="w-full" >
            {
                data.length === 0 ?
                    (<SemDadosComponent<IMovimentacaoRolo> nomeDado="movimentação" data={data} />)
                    :
                    (<div className="border rounded-lg overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={data}
                            isLoading={isLoading}
                            getRowId={(row) => row.id}
                        />
                    </div>)
            }
        </div>
    )
}