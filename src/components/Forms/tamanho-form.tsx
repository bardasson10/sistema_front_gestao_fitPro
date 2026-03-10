import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TamanhoFormValues } from "@/schemas/tamanho-schema";
import { parseNumber } from "@/utils/Formatter/parse-number-format";

export function TamanhoForm() {
  const { control } = useFormContext<TamanhoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: P, M, G, GG" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ordem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ordem</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="Ex: 1"
                defaultValue={field.value}
                onChange={(e) => field.onChange(parseNumber(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
