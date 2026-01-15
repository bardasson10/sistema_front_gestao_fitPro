// components/Forms/Tecido/fabric-form.tsx
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FabricFormValues } from "@/schemas/tecido-schema";
import { Fornecedor } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";

export function FabricForm({ fornecedores }: { fornecedores: Fornecedor[] }) {
  const { control } = useFormContext<FabricFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tipo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Tecido</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Suplex" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Preto" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fornecedorId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fornecedor</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {fornecedores.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
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
          name="largura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largura (cm)</FormLabel>
              <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rendimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rendimento (m/kg)</FormLabel>
              <FormControl><Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}