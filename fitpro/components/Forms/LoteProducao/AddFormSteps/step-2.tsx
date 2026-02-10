import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { useTecidos } from "@/hooks/queries/useMateriais";

export const LoteProducaoAddStep2 = () => {
  const { control } = useFormContext<LoteProducaoFormValues>();
  const { data: rolos = [] } = useEstoqueTecidos();
  const { data: tecidos = [] } = useTecidos();

  return (
    <div className="space-y-4 ">
      <FormField
        control={control}
        name="tecidosUtilizados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecione os Rolos de Tecido Disponíveis</FormLabel>
            <FormControl>
              <div className="flex w-full flex-col space-y-3 rounded-md border border-input bg-background p-3 max-h-96 overflow-y-auto">
                {rolos.length === 0 ? (
                  <span className="text-sm text-muted-foreground">Nenhum rolo disponível</span>
                ) : (
                  rolos.map((rolo) => {
                    const tecido = tecidos.find(t => t.id === rolo.tecidoId);
                    const isSelected = field.value?.some(t => t.roloId === rolo.id) || false;
                    
                    return (
                      <div key={rolo.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded transition">
                        <Checkbox 
                          id={rolo.id} 
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([
                                ...(field.value || []),
                                {
                                  id: rolo.id,
                                  roloId: rolo.id,
                                  tecidoTipo: tecido?.tipo || '',
                                  codigoReferencia: tecido?.codigoReferencia || '',
                                  cor: tecido?.nome || '',
                                  corId: tecido?.corId || '',
                                  rendimentoMetroKg: tecido?.rendimentoMetroKg || 0,
                                  valorPorKg: tecido?.valorPorKg || 0,
                                  gramatura: tecido?.gramatura || 0,
                                  larguraMetros: tecido?.larguraMetros || 0,
                                  pesoAtualKg: rolo.pesoAtualKg || 0,
                                }
                              ]);
                            } else {
                              field.onChange(
                                field.value?.filter(t => t.roloId !== rolo.id) || []
                              );
                            }
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {rolo.codigoBarraRolo}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {tecido?.tipo} - {tecido?.nome}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {parseNumber(rolo.pesoAtualKg || 0)} kg
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
};