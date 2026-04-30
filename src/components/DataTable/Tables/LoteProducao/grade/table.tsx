"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { GradeEditableRow, getGradeDetalhadaColumns } from "./columns";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { useProdutos, useTamanhos } from "@/hooks/queries/useProdutos";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

interface RoloSelecionado {
  id: string;
  codigoBarraRolo: string;
  pesoAtualKg: number;
  corId?: string;
  corNome?: string;
}

interface CorGradeGroup {
  id: string;
  nome: string;
  rolos: RoloSelecionado[];
}

const SEM_COR_ID = "__sem_cor__";

const getOrdemTamanho = (tamanho: { ordem: number; nome: string }) => {
  const ordemPorNome = {
    P: 1,
    M: 2,
    G: 3,
    GG: 4,
  };

  const ordemNumerica = Number(tamanho.ordem);

  if (Number.isFinite(ordemNumerica) && ordemNumerica > 0) {
    return ordemNumerica;
  }

  return ordemPorNome[tamanho.nome as keyof typeof ordemPorNome] ?? Number.MAX_SAFE_INTEGER;
};

export const LoteProducaoTableGrade = ({
  isFormEditable = false,
  isGradeEditMode = false,
  handleAdicionarItens,
}: {
  isFormEditable?: boolean;
  isGradeEditMode?: boolean;
  handleAdicionarItens: (payload: any[]) => void;
}) => {
  const { watch } = useFormContext<LoteProducaoFormValues>();

  const { data: produtosData } = useProdutos();
  const { data: tamanhosData } = useTamanhos();

  const produtos = produtosData?.data || [];
  const tamanhos = useMemo(
    () =>
      (tamanhosData || [])
        .slice()
        .sort((a, b) => getOrdemTamanho(a) - getOrdemTamanho(b)),
    [tamanhosData]
  );

  const materiais = watch("materiais") ?? [];

  const rolosSelecionados = useMemo<RoloSelecionado[]>(() => {
    return materiais.flatMap((material: any) =>
      (material.cores || []).flatMap((cor: any) =>
        (cor.rolos || []).map((rolo: any) => ({
          id: rolo.id,
          codigoBarraRolo: rolo.codigoBarraRolo,
          pesoAtualKg: Number(rolo.pesoAtualKg || 0),
          corId: cor.id,
          corNome: cor.nome,
        }))
      )
    );
  }, [materiais]);

  const gruposPorCor = useMemo<CorGradeGroup[]>(() => {
    const grouped = new Map<string, CorGradeGroup>();

    rolosSelecionados.forEach((rolo) => {
      const corId = rolo.corId || SEM_COR_ID;
      const corNome = rolo.corNome || "Sem cor";

      if (!grouped.has(corId)) {
        grouped.set(corId, { id: corId, nome: corNome, rolos: [] });
      }

      grouped.get(corId)!.rolos.push(rolo);
    });

    return Array.from(grouped.values());
  }, [rolosSelecionados]);

  const [gradeRowsByCor, setGradeRowsByCor] = useState<
    Record<string, GradeEditableRow[]>
  >({});

  const handleAddRow = (corId: string) => {
    setGradeRowsByCor((prev) => ({
      ...prev,
      [corId]: [
        ...(prev[corId] || []),
        {
          id: crypto.randomUUID(),
          produtoId: "",
          roloId: "",
          tamanhos: {},
        },
      ],
    }));
  };

  const handleRemoveRow = (corId: string, index: number) => {
    setGradeRowsByCor((prev) => ({
      ...prev,
      [corId]: prev[corId]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleProdutoChange = (corId: string, index: number, produtoId: string) => {
    setGradeRowsByCor((prev) => ({
      ...prev,
      [corId]: prev[corId].map((row, i) =>
        i === index ? { ...row, produtoId } : row
      ),
    }));
  };

  const handleQuantidadeChange = (
    corId: string,
    index: number,
    tamanhoId: string,
    quantidade: number
  ) => {
    setGradeRowsByCor((prev) => ({
      ...prev,
      [corId]: prev[corId].map((row, i) =>
        i === index
          ? {
              ...row,
              tamanhos: {
                ...row.tamanhos,
                [tamanhoId]: quantidade,
              },
            }
          : row
      ),
    }));
  };

  const handleRoloChange = (corId: string, index: number, roloId: string) => {
    setGradeRowsByCor((prev) => ({
      ...prev,
      [corId]: prev[corId].map((row, i) =>
        i === index ? { ...row, roloId } : row
      ),
    }));
  };

  const handleSalvar = () => {
    const payload: any[] = [];

    Object.entries(gradeRowsByCor).forEach(([corId, rows]) => {
      rows.forEach((row) => {
        tamanhos.forEach((tamanho) => {
          const qtd = Number(row.tamanhos[tamanho.id] ?? 0);
          if (!qtd || !row.produtoId) return;

          payload.push({
            produtoId: row.produtoId,
            tamanhoId: tamanho.id,
            qtdMultiplicadorGrade: qtd,
            corId,
            estoqueRoloId: row.roloId,
          });
        });
      });
    });

    handleAdicionarItens(payload);
  };

  if (!isGradeEditMode) return null;

  return (
    <div className="space-y-6">
      {gruposPorCor.map((grupo) => {
        const rows = gradeRowsByCor[grupo.id] || [];

        const columns = getGradeDetalhadaColumns(
          tamanhos,
          produtos,
          grupo.rolos,
          (index, produtoId) =>
            handleProdutoChange(grupo.id, index, produtoId),
          (index, tamanhoId, qtd) =>
            handleQuantidadeChange(grupo.id, index, tamanhoId, qtd),
          (index, roloId) =>
            handleRoloChange(grupo.id, index, roloId),
          (index) => handleRemoveRow(grupo.id, index),
          isFormEditable
        );

        return (
          <section key={grupo.id} className="space-y-3">
            <h4 className="text-sm font-semibold">Cor: {grupo.nome}</h4>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRow(grupo.id)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar item
            </Button>

            <DataTable columns={columns} data={rows} isLoading={false} />
          </section>
        );
      })}

      <Button
        type="button"
        onClick={handleSalvar}
        className="mt-4"
      >
        Salvar
        <Save className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};