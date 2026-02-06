
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { FaccoesFormValues } from "@/schemas/faccoes-schemas";
import { boolean } from "zod";

export function FaccaoForm({isEditing}: {isEditing: boolean}) {
  const { control } = useFormContext<FaccoesFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: Facção A" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="responsavel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Responsável</FormLabel>
            <FormControl><Input {...field} placeholder="Ex: João Silva" /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isEditing && (
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
                {['ativo', 'inativo'].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />)}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="prazoMedioDias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo médio</FormLabel>
              <FormControl><Input type="number" defaultValue={field.value} onChange={(e) => field.onChange(parseNumber(e.target.value))} /></FormControl>
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
              <FormControl><Input {...field} placeholder="(00) 00000-0000" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}