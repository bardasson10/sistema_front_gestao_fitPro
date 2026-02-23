import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CriarTipoProdutoFormValues } from "@/schemas/produto/tipos-produtos";

export function TipoProdutoForm() {
  const { control } = useFormContext<CriarTipoProdutoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Tipo</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Camiseta" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
