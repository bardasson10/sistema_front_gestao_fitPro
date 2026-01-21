// components/Forms/Tecido/fabric-form.tsx
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FabricFormValues } from "@/schemas/tecido-schema";
import { Fornecedor } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { RoloTecidoFormValues } from "@/schemas/rolo-tecido-schema";

export function StockFabricForm({ tecidos }: { tecidos: { id: string; cor: string; tipo: string }[] }) {
  const { control } = useFormContext<RoloTecidoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="identificacao"
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
                {tecidos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.tipo} - {t.cor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="pesoKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso (kg)</FormLabel>
              <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="indisponivel">Indisponível</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
              </SelectContent>
            </Select>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}