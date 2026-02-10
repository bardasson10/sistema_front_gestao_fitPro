import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useColaboradores } from "@/hooks/queries/useColaboradores";

export const LoteProducaoAddStep1 = () => {
  const { control } = useFormContext<LoteProducaoFormValues>();
  const { data: colaboradoresResponse } = useColaboradores();
  
  // Extract array from paginated response
  const colaboradores = Array.isArray(colaboradoresResponse) 
    ? colaboradoresResponse 
    : (colaboradoresResponse?.data || []);
  
  return (
    <div className="space-y-4 w-full flex flex-col">
      <FormField
        control={control}
        name="codigo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Codigo do Lote</FormLabel>
            <FormControl>
              <Input {...field} placeholder="LOTE-003" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
      
        control={control}
        name="responsavelId"
        render={({ field }) => (
          <FormItem >
            <FormLabel>Responsável</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger className="w-full" disabled={!Array.isArray(colaboradores) || colaboradores.length === 0}>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {!Array.isArray(colaboradores) || colaboradores.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum colaborador disponível
                    </div>
                  ) : (
                    colaboradores.map(colaborador => (
                      <SelectItem key={colaborador.id} value={colaborador.id}>
                        {colaborador.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
