import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CorFormValues } from "@/schemas/cor-schema";

const isHexColor = (value?: string) => /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(value || "");
const toPickerHex = (value?: string) => {
  if (!value || !isHexColor(value)) return "#000000";
  if (value.length === 7) return value.toUpperCase();

  const shortHex = value.replace("#", "");
  return `#${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`.toUpperCase();
};

export function CorForm() {
  const { control, watch, setValue } = useFormContext<CorFormValues>();
  const codigoHex = watch("codigoHex");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: Azul Marinho" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="codigoHex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código HEX</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Você pode escolher a cor no seletor abaixo.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={toPickerHex(codigoHex)}
                    onChange={(event) => setValue("codigoHex", event.target.value.toUpperCase(), { shouldValidate: true })}
                    className="h-9 w-20 cursor-pointer p-1"
                  />
                  <div
                    className="h-9 w-9 rounded-md border"
                    style={{
                      backgroundColor: isHexColor(codigoHex) ? codigoHex : "transparent",
                    }}
                  />
                </div>
                <Input
                  {...field}
                  placeholder="#000000"
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}