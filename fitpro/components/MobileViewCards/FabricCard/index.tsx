import { FabricProps } from "@/types/TecidoComponent/tecido-component"
import { BaseCard } from "../base-card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData"
import { Tecido } from "@/types/production"

export const MobileViewFabric = ({
  tecidos,
  isLoading,
  fornecedores,
  cores,
  onEdit,
  onRemove,
}: FabricProps) => {

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
      <SemDadosComponent<Tecido> nomeDado="tecido" data={tecidos} />
      {Array.isArray(tecidos) && tecidos.map((item) => (
        <BaseCard
          key={item.id}
          title={item.codigoReferencia}
          cardClassName="min-h-fit"
          headerClassName="pb-2"
          action={
            <div
              className="h-5 w-5 rounded-full border shadow-sm"
              style={{ backgroundColor: cores.find(c => c.id === item.corId)?.codigoHex || '#FFFFFF' }}
              title={cores.find(c => c.id === item.corId)?.nome || 'Cor não definida'}
            />
          }

          content={
            <div className="grid gap-1 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">nome:</span>
                <span className="font-medium">{item.nome}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Fornecedor:</span>
                <span className="font-medium">
                  {fornecedores.find(f => f.id === item.fornecedorId)?.nome || '-'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Peso por Kg:</span>
                <span className="font-medium">R$ {item.valorPorKg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rendimento:</span>
                <span className="font-medium">{item.rendimentoMetroKg} m/Kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Largura:</span>
                <span className="font-medium">{item.larguraMetros} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gramatura:</span>
                <span className="font-medium">{item.gramatura} g/m²</span>
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