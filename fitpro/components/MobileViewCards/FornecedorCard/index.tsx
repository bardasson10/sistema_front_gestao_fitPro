
import { BaseCard } from "../base-card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react" 
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { Colaborador, Fornecedor } from "@/types/production"

import { FornecedorProps } from "@/types/FornecedoresComponents/fornecedor-component"

export const MobileViewFornecedor = ({  
  fornecedores,
  isLoading,
  onEdit,
  onRemove,
}: FornecedorProps) => {

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SemDadosComponent<Fornecedor> nomeDado="fornecedor" data={fornecedores} />
      {Array.isArray(fornecedores) && fornecedores.map((item) => (
        <BaseCard
          key={item.id}
          title={item.nome}
          cardClassName="min-h-fit"
          headerClassName="pb-2"
          action={
            <div 
              
            />
          }
          content={
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">
                  {item.tipo || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contato:</span>
                <span className="font-medium">
                  {item.contato || '-'}
                </span>
              </div>
            </div>
          }
          footer={
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(item)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          }
          footerClassName="border-t 0 bg-muted/50 px-6 py-8"
        />
      ))}
    </div>
  )
}