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



export const ProdutoSelectCell = ({
  index,
  produtos
}: {
  index: number;
  produtos: Produto[];
}) => {
  const { control, setValue } = useFormContext();

  return (
    <FormField
      control={control}
      name={`items.${index}.produtoId`}
      render={({ field }) => (
        <FormItem>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);

              // quando trocar produto, limpa tamanho
              setValue(`items.${index}.tamanhoId`, "");
            }}
          >
            <FormControl>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Selecione produto" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {produtos.map((produto) => (
                <SelectItem
                  key={produto.id}
                  value={produto.id}
                >
                  {produto.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};