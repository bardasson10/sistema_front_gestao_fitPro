import { useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Produto } from "@/hooks/queries/useProdutos";


export const TamanhoSelectCell = ({
  index,
  produtos
}: {
  index: number;
  produtos: Produto[];
}) => {
  const { control } = useFormContext();

  const produtoId = useWatch({
    control,
    name: `items.${index}.produtoId`
  });

  const produtoSelecionado = produtos.find(
    (p) => p.id === produtoId
  );

  const tamanhos = produtoSelecionado?.tipo.tamanhos || [];

  return (
    <FormField
      control={control}
      name={`items.${index}.tamanhoId`}
      render={({ field }) => (
        <FormItem>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={!produtoSelecionado}
          >
            <FormControl>
              <SelectTrigger className="w-30">
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {tamanhos.map((tamanhoTipo) => (
                <SelectItem
                  key={tamanhoTipo.id}
                  value={tamanhoTipo.tamanhoId}
                >
                  {tamanhoTipo.tamanho.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};