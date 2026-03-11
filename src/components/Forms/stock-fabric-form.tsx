import { useFieldArray, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cor, Tecido } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { RoloTecidoFormValues } from "@/schemas/rolo-tecido-schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface StockFabricFormProps {
  tecidos: Tecido[];
  cores: Cor[];
  isEditing?: boolean;
}


export function StockFabricForm({ tecidos, cores, isEditing = false }: StockFabricFormProps) {
  const { control } = useFormContext<RoloTecidoFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rolos",
  });

  return (
    <div className="space-y-4">
      {!isEditing && (
        <>
          <FormField
            control={control}
            name="tecidoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tecido</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tecidos.map((tecido) => (
                      <SelectItem key={tecido.id} value={tecido.id}>
                        {tecido.codigoReferencia} - {cores.find((cor) => cor.id === tecido.corId)?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="prefixo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefixo do Lote</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="EX: SPP" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="dataLote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Lote</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <FormLabel className="m-0">Pesos dos Rolos (kg)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ pesoInicialKg: 0 })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Peso
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2">
                  <FormField
                    control={control}
                    name={`rolos.${index}.pesoInicialKg` as const}
                    render={({ field: pesoField }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={`Peso do rolo ${index + 1}`}
                            value={pesoField.value ?? ""}
                            onChange={(e) => pesoField.onChange(parseNumber(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <>
          <FormField
            control={control}
            name="codigoBarraRolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Rolo</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="pesoAtualKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Atual (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseNumber(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={control}
        name="situacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}