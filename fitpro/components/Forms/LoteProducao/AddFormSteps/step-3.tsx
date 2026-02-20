import React, { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";

export const LoteProducaoAddStep3 = () => {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();
  
  const { data: produtosResp, isLoading: pLoading, error: pError } = useProdutos();
  const { data: tamanhosResp, isLoading: tLoading, error: tError } = useTamanhos();

  // Tratamento para garantir que enviamos arrays para os componentes
  const produtos = useMemo(() => (Array.isArray(produtosResp) ? produtosResp : (produtosResp as any)?.data || []), [produtosResp]);
  const tamanhos = useMemo(() => (Array.isArray(tamanhosResp) ? tamanhosResp : (tamanhosResp as any)?.data || []), [tamanhosResp]);

  const grade = watch("grade") || [];
  const { fields } = useFieldArray({ control, name: "grade" });

  const isLoading = pLoading || tLoading;
  const hasError = !!pError || !!tError;

  // Cálculo do total geral reativo (soma todos os tamanhos de todas as linhas)
  const totalGeral = useMemo(() => {
    return grade.reduce((acc, row: any) => {
      return acc + (Number(row.gradePP || 0) + Number(row.gradeP || 0) + Number(row.gradeM || 0) + Number(row.gradeG || 0) + Number(row.gradeGG || 0));
    }, 0);
  }, [grade]);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex gap-3 animate-pulse">
          <AlertCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
          <p className="text-sm text-cyan-800 font-medium">Carregando dados necessários...</p>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 italic">Pronto para definir as grades de produção.</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Produtos e Grades</h3>
          {grade.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              {grade.length} produtos selecionados • <span className="text-primary font-bold">{totalGeral} peças no lote</span>
            </div>
          )}
        </div>
        
        <LoteProducaoTableGrade
          produtos={produtos}
          tamanhos={tamanhos}
          isLoading={isLoading}
          viewOnRemove={true}
          isEditing={true}
        />
      </div>
    </div>
  );
};