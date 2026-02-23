
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FornecedorFormValues } from "@/schemas/fornecedor-schema";

export function FornecedoresForm() {
  const { control } = useFormContext<FornecedorFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: João Silva" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />


      <FormField
        control={control}
        name="tipo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {['tecido', 'aviamento', 'servico'].map((funcao) => (
                  <SelectItem key={funcao} value={funcao}>{funcao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contato"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contato</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: 22 99999-9999" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />


    </div>
  );
}