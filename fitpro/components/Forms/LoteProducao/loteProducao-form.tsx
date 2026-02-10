
import { Badge } from "@/components/ui/badge"
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Button } from "@/components/ui/button";
import { Pencil, Save } from "lucide-react";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";
import { useState } from "react";




interface LoteProducaoFormProps {
  isEditing?: boolean;
}

export function LoteProducaoForm({ isEditing = true }: LoteProducaoFormProps) {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();
  const [isViewRemoveMode, setIsViewRemoveMode] = useState<boolean>(false);

  // Assistir aos tecidosUtilizados para obter peso e valor
  const tecidosUtilizados = watch('tecidosUtilizados');
  const rolos = watch('rolos');





  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-2 gap-24">
        <FormField
          control={control}
          name="createdAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Criação</FormLabel>
              <FormControl>
                <span className="text-accent-foreground font-light">
                  {field.value ? dataFormatter(new Date(field.value)) : '-'}
                </span>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Badge
                  loteProducaoStatus={(field.value || "planejado") as any}
                  className="w-fit h-8 font-medium"
                >
                  {field.value || 'Planejado'}
                </Badge>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="tecidosUtilizados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tecidos Utilizados</FormLabel>
            <FormControl>
              <div className="flex w-full flex-col space-y-3 rounded-md border border-input bg-background p-4">
                {field.value?.map((tecido, index) => (
                  <div key={index} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                    {/* Tipo e Cor */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {tecido.tecidoTipo}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({tecido.cor})
                        </span>
                      </div>
                    </div>


                    {/* Rendimento, Largura e Gramatura */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Rendimento</span>
                        <p className="font-medium text-foreground">{parseNumber(tecido.rendimentoMetroKg)} m/kg</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Largura</span>
                        <p className="font-medium text-foreground">{parseNumber(tecido.larguraMetros)} m</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Gramatura</span>
                        <p className="font-medium text-foreground">{parseNumber(tecido.gramatura)} g/m²</p>
                      </div>
                    </div>

                    {/* Valor por Kg e Peso Disponível */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                  
                      <div>
                        <span className="text-xs text-muted-foreground">Código de Referência</span>
                        <p className="font-medium text-foreground">{tecido.codigoReferencia}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Peso Disponível (Rolo)</span>
                        <p className="font-medium text-foreground">{parseNumber(rolos[index]?.pesoAtualKg)} kg</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Valor por Kg</span>
                        <p className="font-medium text-foreground">R$ {parseNumber(tecido.valorPorKg)}</p>
                      </div>
                    </div>

                    {/* Valor Total do Rolo */}
                    <div className="bg-muted/50 rounded  px-2 py-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-md font-semibold text-muted-foreground">Valor Total do Rolo</span>
                        <span className="text-sm font-bold text-foreground">
                          R$ {parseNumber((rolos[index]?.pesoAtualKg || 0) * (tecidosUtilizados[index]?.valorPorKg || 0))}
                        </span>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />



      <div className="flex justify-between items-center">
        <span className="text-accent-foreground font-light text-sm">Grade de Produção</span>
        <div className="flex items-center gap-2.5">
          <Button 
            className="variant-outline w-fit" 
            size="default"
            disabled={!isEditing}
            onClick={() => setIsViewRemoveMode(false)}
          >
            Cancelar
          </Button>
          {isViewRemoveMode ? (
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="default"
              type="button"
              disabled={!isEditing}
              onClick={() => setIsViewRemoveMode(false)}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-fit"
              size="default"
              type="button"
              disabled={!isEditing}
              onClick={() => setIsViewRemoveMode(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Grade
            </Button>
          )}
        </div>
      </div>

      <FormField
        control={control}
        name="grade"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <LoteProducaoTableGrade
                grade={field.value?.map((g, index) => ({ ...g, id: index.toString() })) || []}
                isLoading={false}
                viewOnRemove={isViewRemoveMode && isEditing}
                isEditing={isEditing}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
}