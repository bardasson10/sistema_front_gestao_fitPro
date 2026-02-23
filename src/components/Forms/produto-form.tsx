import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProdutoFormValues } from "@/schemas/produto/produto-schema";
import { TiposProdutosSchema } from "@/hooks/queries/useProdutos";
import { parseNumber } from "@/utils/Formatter/parse-number-format";

interface ProdutoFormProps {
  tiposProduto: TiposProdutosSchema[];
}

export function ProdutoForm({ tiposProduto }: ProdutoFormProps) {
  const { control } = useFormContext<ProdutoFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tipoProdutoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo do produto</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {tiposProduto.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Camiseta Dry Fit" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: CAM-DRY-001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fabricante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fabricante</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: FitPro" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="custoMedioPeca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custo médio por peça (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step={0.01}
                  value={parseNumber(field.value)}
                  onChange={(event) => field.onChange(parseNumber(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="precoMedioVenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço médio de venda (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step={0.01}
                  value={parseNumber(field.value)}
                  onChange={(event) => field.onChange(parseNumber(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}