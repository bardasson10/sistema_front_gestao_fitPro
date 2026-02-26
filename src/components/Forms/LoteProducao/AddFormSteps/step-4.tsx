import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { CheckCircle2 } from "lucide-react";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";
import { FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useGradeEdicao } from "@/hooks/use-grade-edicao";

interface Props {
  isEditing?: boolean;
  gradeEdicao: ReturnType<typeof useGradeEdicao>;
  handleAdicionarItens: () => void;
}

export const LoteProducaoAddStep4 = ({ isEditing = false, gradeEdicao, handleAdicionarItens }: Props) => {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();

  const {
    setModoAdicaoItens,
    isGradeEditMode,
    setIsGradeEditMode,
    podeEditar
  } = gradeEdicao;

  const items = watch("gradeLote") || [];

  // Total geral de peças
  const totalGeral = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + (item.quantidadePlanejada || 0);
    }, 0);
  }, [items]);

  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">
            Produtos e Grades
          </h3>

          {hasItems && (
            <div className="text-sm font-medium text-muted-foreground">
              {items.length} produtos •{" "}
              <span className="text-primary font-bold">
                {totalGeral} peças no lote
              </span>
            </div>
          )}
        </div>

        <FormField
          control={control}
          name="gradeLote"
          render={({ field }) => (
            <div className="space-y-3">
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setModoAdicaoItens(true);
                      setIsGradeEditMode(true);
                    }}
                  >
                    Adicionar Itens
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGradeEditMode((prev) => !prev)}
                >
                  Editar Grade
                </Button>
              </div>

              <div className="w-full max-h-96 overflow-auto rounded-md border border-input bg-background">
                <LoteProducaoTableGrade
                  itensLote={field.value || []}
                  isFormEditable={podeEditar}
                  isGradeEditMode={isGradeEditMode}
                  handleAdicionarItens={handleAdicionarItens}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};