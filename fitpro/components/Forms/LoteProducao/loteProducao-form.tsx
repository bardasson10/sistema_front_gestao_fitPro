
import { Badge } from "@/components/ui/badge"
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { parseNumber } from "@/utils/Formatter/parse-number-format";
import { dataFormatter } from "@/utils/Formatter/data-brasil-format";
import { Button } from "@/components/ui/button";
import { Pencil, Save } from "lucide-react";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";
import { useState } from "react";




export function LoteProducaoForm() {
  const { control } = useFormContext<LoteProducaoFormValues>();
  const [isViewRemoveMode, setIsViewRemoveMode] = useState<boolean>(false);

  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-2 gap-24">
        <FormField
          control={control}
          name="dataCreacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Criação</FormLabel>
              <FormControl><span className="text-accent-foreground font-light">{dataFormatter(field.value)}</span></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Badge loteProducaoStatus={field.value || "criado"} className="w-fit h-8 font-medium">{field.value}</Badge>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="tecidosUtilizados"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tecidos Utilizados</FormLabel>
            <FormControl>
              <div className="flex w-full flex-col space-y-2 rounded-md border border-input bg-background p-3">
                {field.value?.map((tecido, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-md text-muted-foreground ">
                      {tecido.tecidoTipo} - {tecido.cor}
                    </span>
                    <span className="text-md font-medium">
                      {parseNumber(tecido.pesoKg)} kg
                    </span>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between items-center">
        <span className="text-accent-foreground font-light text-sm">Grade de Produção</span>
        <div className="flex items-center gap-2.5">
          <Button className="variant-outline w-fit" size="default"
            onClick={() => setIsViewRemoveMode(false)}>Cancelar</Button>
          {isViewRemoveMode ? (

            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="default"
              type="button"
              onClick={() => setIsViewRemoveMode(false)}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-fit"
              size="default"
              type="button"
              onClick={() => setIsViewRemoveMode(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Grade
            </Button>
          )}
        </div>
      </div>

      <FormField
        control={control}
        name="grade"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <LoteProducaoTableGrade
                grade={field.value?.map((g, index) => ({ ...g, id: index.toString() })) || []}
                isLoading={false}
                viewOnRemove={isViewRemoveMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
}