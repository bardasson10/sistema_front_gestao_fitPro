import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { BaseCard } from "@/components/MobileViewCards/base-card"
import { getGroupedStockColumns } from "@/components/DataTable/Tables/Estoque/resume-colums"
import { EstoqueTecido } from "@/types/production"
import { StockResumeProps } from "@/types/StockComponents/stock-components"
import React from "react"



export const MobileViewStockResume = ({
  rolos,
  tecidos,
  cores,
  isLoading,
}: StockResumeProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  const resumoData = React.useMemo(
    () => getGroupedStockColumns(rolos, tecidos, cores),
    [rolos, tecidos, cores]
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<EstoqueTecido> nomeDado="tecido" data={rolos} />
      {resumoData.map((item) => (
        <BaseCard
          key={item.id}
          title={item.codigoReferencia}
          cardClassName="min-h-fit"
          headerClassName="pb-2"
          action={
            <div
              className="h-5 w-5 rounded-full border shadow-sm"
              style={{ backgroundColor: item.cor }}
              title={item.nomeCor}
            />
          }
          content={
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Qtd Rolos:</span>
                <span className="font-medium">{item.rolos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso Total:</span>
                <span className="font-medium">
                  {item.pesoKg.toFixed(1)} Kg
                </span>
              </div>
            </div>
          }
        //     footer={
        //       <div className="flex w-full gap-2">
        //         <Button
        //           variant="outline"
        //           className="flex-1"
        //           onClick={() => onEdit(item)}
        //         >
        //           <Pencil className="mr-2 h-4 w-4" />
        //           Editar
        //         </Button>
        //         {/* <Button
        //            variant="destructive"
        //            size="icon"
        //            onClick={() => onRemove(item.id)}
        //          >
        //            <Trash2 className="h-4 w-4" />
        //          </Button> */}
        //       </div>
        //     }
        //     footerClassName="border-t 0 bg-muted/50 px-6 py-8"
        />
      ))}

    </div>
  )
}