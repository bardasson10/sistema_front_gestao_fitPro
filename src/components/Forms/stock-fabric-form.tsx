// components/Forms/Tecido/fabric-form.tsx
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FabricFormValues } from "@/schemas/tecido-schema";
import { Cor, Fornecedor, Tecido } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { RoloTecidoFormValues } from "@/schemas/rolo-tecido-schema";

interface StockFabricFormProps {
  tecidos: Tecido[];
  cores: Cor[];
}


export function StockFabricForm({ tecidos, cores }: StockFabricFormProps) {
  const { control } = useFormContext<RoloTecidoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="codigoBarraRolo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Tecido</FormLabel>
            <FormControl><Input {...field} placeholder="SPX-001" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tecidoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tecido</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {tecidos.map(tecido => (
                  <SelectItem
                    key={tecido.id}
                    value={tecido.id}>{tecido.codigoReferencia} - {cores.find(cor => cor.id === tecido.corId)?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* <FormField
          control={control}
          name="pesoInicialKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso Inicial (kg)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

          <FormField
            control={control}
            name="pesoAtualKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

      </div>

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
          </FormItem>
        )}
      />
    </div>
  );
}