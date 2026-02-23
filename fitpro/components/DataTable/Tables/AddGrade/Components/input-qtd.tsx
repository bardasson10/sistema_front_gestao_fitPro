import { useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const QuantidadeCell = ({ index }: { index: number }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={`items.${index}.quantidadePlanejada`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              type="number"
              min={1}
              className="w-20 text-center"
              value={field.value ?? 1}
              onChange={(e) =>
                field.onChange(Number(e.target.value))
              }
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};