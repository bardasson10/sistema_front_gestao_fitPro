import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { AssociarTamanhoFormValues } from "@/schemas/produto/tipos-produtos";
import { Tamanho } from "@/hooks/queries/useProdutos";

interface AssociarTamanhoFormProps {
  tamanhos: Tamanho[];
}

export function AssociarTamanhoForm({ tamanhos }: AssociarTamanhoFormProps) {
  const { control } = useFormContext<AssociarTamanhoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tamanhos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tamanhos</FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                {tamanhos.map((tamanho) => {
                  const checked = field.value?.includes(tamanho.id);
                  return (
                    <label
                      key={tamanho.id}
                      className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          const next = new Set(field.value || []);
                          if (isChecked) {
                            next.add(tamanho.id);
                          } else {
                            next.delete(tamanho.id);
                          }
                          field.onChange(Array.from(next));
                        }}
                      />
                      <span>{tamanho.nome}</span>
                    </label>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
