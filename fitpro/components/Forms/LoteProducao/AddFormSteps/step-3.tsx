import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { LoteProducaoTableGrade } from "@/components/DataTable/Tables/LoteProducao/grade/table";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export const LoteProducaoAddStep3 = () => {
  const { control, watch } = useFormContext<LoteProducaoFormValues>();
  const { data: produtos = [], isLoading: produtosLoading, error: produtosError } = useProdutos();
  const { data: tamanhos = [], isLoading: tamanhosLoading, error: tamanhosError } = useTamanhos();
  const grade = watch("grade") || [];

  const { fields } = useFieldArray({
    control,
    name: "grade",
  });

  const isLoading = produtosLoading || tamanhosLoading;
  const hasError = !!produtosError || !!tamanhosError;

  // Debug: Log para verificar carregamento de produtos
  useEffect(() => {
    console.log('📊 Step 3 - Produtos:', produtos?.length || 0, 'Tamanhos:', tamanhos?.length || 0);
  }, []);  // Executar apenas uma vez na montagem

  const totalQuantidade = grade.reduce((acc, item: any) => {
    const total = (item.gradePP || 0) + (item.gradeP || 0) + (item.gradeM || 0) + (item.gradeG || 0) + (item.gradeGG || 0);
    return acc + total;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Status de Carregamento */}
      {isLoading && (
        <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 flex gap-3">
          <div className="animate-spin">
            <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
          </div>
          <div>
            <h4 className="font-medium text-cyan-900 dark:text-cyan-100">Carregando dados...</h4>
            <p className="text-sm text-cyan-800 dark:text-cyan-200">Buscando produtos e tamanhos disponíveis.</p>
          </div>
        </div>
      )}

      {/* Status de Sucesso */}
      {!isLoading && !hasError && produtos.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">
            <span className="font-semibold">{produtos.length}</span> produtos e <span className="font-semibold">{tamanhos.length}</span> tamanhos carregados com sucesso!
          </p>
        </div>
      )}

      {/* Informações Resume */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Definir Produtos e Grades</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Adicione os produtos que serão produzidos neste lote, especificando as quantidades para cada tamanho (PP, P, M, G, GG).
            </p>
          </div>
        </div>
      </div>

      {/* Erro ao carregar dados */}
      {hasError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-100">Erro ao carregar dados</h4>
            <p className="text-sm text-red-800 dark:text-red-200">
              Não foi possível carregar os produtos ou tamanhos. Verifique sua conexão e tente novamente.
            </p>
          </div>
        </div>
      )}

      {/* Tabela de Grade */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Produtos e Grades</h3>
          {grade.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{grade.length}</span> produto{grade.length !== 1 ? 's' : ''} • 
              <span className="font-medium ml-1">{totalQuantidade}</span> peças
            </div>
          )}
        </div>
        
        <LoteProducaoTableGrade
          grade={fields} 
          isLoading={isLoading}
          viewOnRemove={true}
          produtos={produtos}
          tamanhos={tamanhos}
          isEditing={true}
        />
      </div>

      {/* Dica de uso */}
      {!isLoading && grade.length === 0 && produtos.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 Use o formulário abaixo para adicionar produtos à grade. Selecione o produto e defina as quantidades para cada tamanho.
          </p>
        </div>
      )}

      {/* Aviso quando não há produtos */}
      {!isLoading && produtos.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Nenhum produto disponível. Crie produtos antes de prosseguir.
          </p>
        </div>
      )}
    </div>
  );
};