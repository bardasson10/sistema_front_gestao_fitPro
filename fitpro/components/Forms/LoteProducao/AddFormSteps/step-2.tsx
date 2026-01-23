import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { Checkbox } from "@/components/ui/checkbox";
import { useProduction } from "@/providers/PrivateContexts/ProductionProvider";

export const LoteProducaoAddStep2 = () => {
  const { control } = useFormContext<LoteProducaoFormValues>();
  const { tecidos, rolos } = useProduction();
  return (
    <div className="space-y-4 ">
      <FormField
        control={control}
        name="tecidosUtilizados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecione os Rolos de Tecido</FormLabel>
            <FormControl>
              <div className="flex w-full flex-col space-y-2 rounded-md border border-input bg-background p-3">
                {tecidos.map((tecido, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    <Checkbox id={tecido.id} name={tecido.tipo}/>
                    <span className="text-md text-muted-foreground ">
                      {tecido.tipo} - {tecido.cor}
                    </span>
                    </div>
                      <span className="text-md font-medium">
                        {parseNumber(rolos.find(rolo => rolo.tecidoId === tecido.id)?.pesoKg || 0)} kg
                      </span>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
};