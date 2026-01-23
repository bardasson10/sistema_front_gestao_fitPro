import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";


const PRODUTOS_DISPONIVEIS = ['legging', 'short', 'top', 'calca', 'conjunto', 'body', 'macaquinho'];
export const LoteProducaoAddStep3 = () => {
  const { control } = useFormContext<LoteProducaoFormValues>();

  const { append } = useFieldArray({
    control,
    name: "grade",
  });

  const [novoItem, setNovoItem] = useState({
    produto: "",
    gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0
  });

  const handleAddItem = () => {
    if (!novoItem.produto) return;

    const totalCalculado =
      Number(novoItem.gradePP) +
      Number(novoItem.gradeP) +
      Number(novoItem.gradeM) +
      Number(novoItem.gradeG) +
      Number(novoItem.gradeGG);

    append({
      id: crypto.randomUUID(),
      produto: novoItem.produto as any,
      gradePP: Number(novoItem.gradePP),
      gradeP: Number(novoItem.gradeP),
      gradeM: Number(novoItem.gradeM),
      gradeG: Number(novoItem.gradeG),
      gradeGG: Number(novoItem.gradeGG),
      total: totalCalculado
    });

    setNovoItem({ produto: "", gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0 });
  };
  return (
    <div className="space-y-4 ">
      <FormField
        control={control}
        name="grade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecione os Produtos</FormLabel>
            <FormControl>
              <div className="flex flex-wrap items-center gap-3 p-4 border border-dashed rounded-lg bg-muted/40 mt-4">

                <div className="flex-1 min-w-45 space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground ml-1">Produto</span>
                  <Select
                    value={novoItem.produto}
                    onValueChange={(val) => setNovoItem({ ...novoItem, produto: val })}
                  >
                    <SelectTrigger className="bg-background h-9 w-full shadow-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUTOS_DISPONIVEIS.map((item, index) => (
                        <SelectItem key={index} value={item} className="capitalize">
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {['gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG'].map((key) => (
                  <div key={key} className="space-y-1.5">
                    <span className="text-xs font-medium text-center block uppercase text-muted-foreground">
                      {key.replace('grade', '')}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      className="bg-background h-9 w-14 text-center px-1 shadow-sm transition-all focus:w-16"
                      value={(novoItem as any)[key]}
                      onChange={(e) => setNovoItem({ ...novoItem, [key]: Number(e.target.value) })}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!novoItem.produto}
                  className="h-9 px-4 shadow-sm flex items-end mt-5"
                >
                  <Plus className="h-4 w-4 " />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="grade"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <LoteProducaoTableGrade
                grade={field.value?.map((g, index) => ({ ...g, id: index.toString() })) || []}
                isLoading={false}
                viewOnRemove={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  )
};