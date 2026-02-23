
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FabricFormValues } from "@/schemas/tecido-schema";
import { Cor, Fornecedor } from "@/types/production";
import { parseNumber } from "@/utils/Formatter/parse-number-format";


export function FabricForm({ fornecedores, cores }: { fornecedores: Fornecedor[]; cores: Cor[] }) {
  const { control } = useFormContext<FabricFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
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
        name="codigoReferencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de Referência</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: REF123" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="corId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {cores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome} - {c.codigoHex}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          name="larguraMetros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Largura (cm)</FormLabel>
              <FormControl><Input step={0.1} type="number" value={parseNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rendimentoMetroKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rendimento (m/kg)</FormLabel>
              <FormControl><Input step={0.01} type="number"  value={parseNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="valorPorKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor por Kg (R$)</FormLabel>
              <FormControl><Input step={0.01} type="number" value={parseNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="gramatura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gramatura (g/m²)</FormLabel>
              <FormControl><Input  step={0.01} type="number" value={parseNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>
    </div>
  );
}