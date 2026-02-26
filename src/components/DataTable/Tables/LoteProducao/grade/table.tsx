"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { GradeEditableRow, getGradeDetalhadaColumns } from "./columns";
import { useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { mapToGrade } from "@/utils/Mapper/tamanho-helper";
import { useProdutos } from "@/hooks/queries/useProdutos";
import { useTamanhos } from "@/hooks/queries/useProdutos";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

export interface Tamanho {
  id: string;
  nome: string;
  ordem: number;
}

export interface Produto {
  id: string;
  nome: string;
}

export interface ItemLote {
  id?: string;
  produtoId: string;
  tamanhoId: string;
  corId?: string;
  rolos?: Array<{
    estoqueRoloId: string;
    pesoReservado: number;
  }>;
  produto?: Produto;
  tamanho?: Tamanho;
  quantidadePlanejada: number;
}

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

export const LoteProducaoTableGrade = ({
  itensLote,
  isFormEditable = false,
  isGradeEditMode = false,
  handleAdicionarItens,

}: {
  itensLote: ItemLote[];
  isFormEditable?: boolean;
  isGradeEditMode?: boolean;
  handleAdicionarItens: () => void;
}) => {
  const { data: produtosData } = useProdutos();
  const { data: tamanhosData } = useTamanhos();
  const produtos = produtosData?.data || [];
  const tamanhos = useMemo(
    () => (tamanhosData || []).slice().sort((a, b) => a.ordem - b.ordem),
    [tamanhosData]
  );

  const { setValue, watch } = useFormContext<LoteProducaoFormValues>();

  const materiais = watch("materiais");
  const materiaisArray = Array.isArray(materiais) ? materiais : [];

  const rolosSelecionados = useMemo<RoloSelecionado[]>(() => {
    return materiaisArray.flatMap((material) =>
      (material.cores || []).flatMap((cor) =>
        (cor.rolos || []).map((rolo) => ({
          id: rolo.id,
          codigoBarraRolo: rolo.codigoBarraRolo || "",
          pesoAtualKg: Number(rolo.pesoAtualKg || 0),
          corId: cor.id,
          corNome: cor.nome,
        }))
      )
    );
  }, [materiaisArray]);
  const [gradeRowsByCor, setGradeRowsByCor] = useState<Record<string, GradeEditableRow[]>>({});
  const gradeInitializedRef = useRef(false);
  const lastItemsPayloadRef = useRef<string>("");

  const gruposPorCor = useMemo<CorGradeGroup[]>(() => {
    const grouped = new Map<string, CorGradeGroup>();

    rolosSelecionados.forEach((rolo) => {
      const corId = rolo.corId || SEM_COR_ID;
      const corNome = rolo.corNome || "Sem cor";

      if (!grouped.has(corId)) {
        grouped.set(corId, {
          id: corId,
          nome: corNome,
          rolos: [],
        });
      }

      grouped.get(corId)?.rolos.push(rolo);
    });

    const grupos = Array.from(grouped.values());

    if (grupos.length === 0) {
      return [{ id: SEM_COR_ID, nome: "Sem cor", rolos: [] }];
    }

    return grupos;
  }, [rolosSelecionados]);

  useEffect(() => {
    if (!isGradeEditMode) {
      gradeInitializedRef.current = false;
      lastItemsPayloadRef.current = "";
      return;
    }

    if (gradeInitializedRef.current) {
      return;
    }

    const groupedByCorProduto = new Map<string, GradeEditableRow>();
    const roloToCor = new Map(rolosSelecionados.map((rolo) => [rolo.id, rolo.corId || SEM_COR_ID]));

    itensLote.forEach((item, index) => {
      const produtoId = item.produtoId || "";
      const tamanhoId = item.tamanhoId || "";
      const roloId = item.rolos?.[0]?.estoqueRoloId || "";
      const corId = item.corId || roloToCor.get(roloId) || SEM_COR_ID;
      const mapKey = `${corId}::${produtoId}`;

      if (!groupedByCorProduto.has(mapKey)) {
        groupedByCorProduto.set(mapKey, {
          id: item.id || `row-${corId}-${produtoId || index}`,
          produtoId,
          roloId,
          tamanhos: {},
        });
      }

      const row = groupedByCorProduto.get(mapKey)!;
      row.tamanhos[tamanhoId] = Number(item.quantidadePlanejada || 0);
    });

    const initialByCor: Record<string, GradeEditableRow[]> = {};
    groupedByCorProduto.forEach((row, key) => {
      const [corId] = key.split("::");
      if (!initialByCor[corId]) {
        initialByCor[corId] = [];
      }
      initialByCor[corId].push(row);
    });

    const fallbackCor = gruposPorCor[0]?.id || SEM_COR_ID;

    if (Object.keys(initialByCor).length === 0) {
      setGradeRowsByCor({
        [fallbackCor]: [
          {
            id: `row-new-${fallbackCor}-0`,
            produtoId: "",
            roloId: "",
            tamanhos: {},
          },
        ],
      });
      gradeInitializedRef.current = true;
      return;
    }

    gruposPorCor.forEach((grupo) => {
      if (!initialByCor[grupo.id]) {
        initialByCor[grupo.id] = [
          {
            id: `row-new-${grupo.id}-0`,
            produtoId: "",
            roloId: "",
            tamanhos: {},
          },
        ];
      }
    });

    setGradeRowsByCor(initialByCor);
    gradeInitializedRef.current = true;
  }, [isGradeEditMode, itensLote, gruposPorCor, rolosSelecionados]);

  useEffect(() => {
    if (!isGradeEditMode || !gradeInitializedRef.current || gruposPorCor.length === 0) {
      return;
    }

    setGradeRowsByCor((prev) => {
      let changed = false;
      const next = { ...prev };

      gruposPorCor.forEach((grupo) => {
        if (!next[grupo.id]) {
          next[grupo.id] = [
            {
              id: `row-new-${grupo.id}-0`,
              produtoId: "",
              roloId: "",
              tamanhos: {},
            },
          ];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [isGradeEditMode, gruposPorCor]);

  useEffect(() => {
    if (!isGradeEditMode) return;

    // Construir array de itens candidatos
    const gradeLotePayload: Array<{
      id: string;
      produtoId: string;
      tamanhoId: string;
      quantidadePlanejada: number;
      produtoNome: string;
      sku: string;
      tamanhoNome: string;
    }> = [];

    Object.entries(gradeRowsByCor).forEach(([corId, rows]) => {
      rows.forEach((row) => {
        tamanhos.forEach((tamanho) => {
          const quantidadePlanejada = Number(row.tamanhos[tamanho.id] ?? 0);
          if (!quantidadePlanejada || quantidadePlanejada <= 0 || !row.produtoId || !tamanho.id) {
            return;
          }

          gradeLotePayload.push({
            id: row.id || `grade-${row.produtoId}-${tamanho.id}`,
            produtoId: row.produtoId,
            tamanhoId: tamanho.id,
            quantidadePlanejada,
            produtoNome: produtos.find((produto) => produto.id === row.produtoId)?.nome || "",
            sku: "",
            tamanhoNome: tamanho.nome || "",
          });
        });
      });
    });

    const serializedPayload = JSON.stringify(gradeLotePayload);
    if (serializedPayload === lastItemsPayloadRef.current) {
      return;
    }

    lastItemsPayloadRef.current = serializedPayload;
    setValue("gradeLote", gradeLotePayload, { shouldDirty: true });
  }, [isGradeEditMode, gradeRowsByCor, produtos, rolosSelecionados, setValue, tamanhos]);

  const gradeData = useMemo(
    () => mapToGrade(itensLote),
    [itensLote]
  );

  const gradeDataReadonly = useMemo(
    () =>
      gradeData.map((row) => ({
        id: `readonly-${row.produtoId}`,
        produtoId: row.produtoId,
        produtoNome: row.produtoNome,
        roloId: "",
        tamanhos: row.tamanhos,
      })),
    [gradeData]
  );

  const colunasTamanhoVisualizacao = useMemo(() => {
    const unique = new Set<string>();

    gradeData.forEach((row) => {
      Object.keys(row.tamanhos).forEach((nomeTamanho) => unique.add(nomeTamanho));
    });

    return Array.from(unique).map((nome) => ({ id: nome, nome }));
  }, [gradeData]);

  const handleAddRow = (corId: string) => {
    setGradeRowsByCor((prev) => {
      const currentRows = prev[corId] || [];
      return {
        ...prev,
        [corId]: [
          ...currentRows,
          {
            id: `row-new-${corId}-${currentRows.length}`,
            produtoId: "",
            roloId: "",
            tamanhos: {},
          },
        ],
      };
    });
  };

  const handleRemoveRow = (corId: string, index: number) => {
    setGradeRowsByCor((prev) => {
      const currentRows = prev[corId] || [];
      return {
        ...prev,
        [corId]: currentRows.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const handleProdutoChange = (corId: string, index: number, produtoId: string) => {
    setGradeRowsByCor((prev) => {
      const currentRows = prev[corId] || [];
      return {
        ...prev,
        [corId]: currentRows.map((row, currentIndex) =>
          currentIndex === index
            ? {
                ...row,
                produtoId,
              }
            : row
        ),
      };
    });
  };

  const handleQuantidadeChange = (corId: string, index: number, tamanhoId: string, quantidade: number) => {
    setGradeRowsByCor((prev) => {
      const currentRows = prev[corId] || [];
      return {
        ...prev,
        [corId]: currentRows.map((row, currentIndex) =>
          currentIndex === index
            ? {
                ...row,
                tamanhos: {
                  ...row.tamanhos,
                  [tamanhoId]: quantidade,
                },
              }
            : row
        ),
      };
    });
  };

  const handleRoloChange = (corId: string, index: number, roloId: string) => {
    setGradeRowsByCor((prev) => {
      const currentRows = prev[corId] || [];
      return {
        ...prev,
        [corId]: currentRows.map((row, currentIndex) =>
          currentIndex === index
            ? {
                ...row,
                roloId,
              }
            : row
        ),
      };
    });
  };

  const columns = useMemo(
    () =>
      getGradeDetalhadaColumns(
        colunasTamanhoVisualizacao,
        [],
        [],
        () => undefined,
        () => undefined,
        () => undefined,
        undefined,
        false
      ),
    [colunasTamanhoVisualizacao]
  );

  return (

    <>
      {!isGradeEditMode ? (
        <DataTable
          columns={columns}
          data={gradeDataReadonly}
          isLoading={false}
        />
      ) : (
        <div>
          {gruposPorCor.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-4">
              Selecione rolos no passo anterior para montar as grades por cor.
            </p>
          ) : (
            <div className="space-y-6">
              {gruposPorCor.map((grupo) => {
                const rows = gradeRowsByCor[grupo.id] || [];
                const gradeEditColumns = getGradeDetalhadaColumns(
                  tamanhos,
                  produtos.map((produto) => ({ id: produto.id, nome: produto.nome })),
                  grupo.rolos.map((rolo) => ({ id: rolo.id, codigoBarraRolo: rolo.codigoBarraRolo })),
                  (index, produtoId) => handleProdutoChange(grupo.id, index, produtoId),
                  (index, tamanhoId, quantidade) => handleQuantidadeChange(grupo.id, index, tamanhoId, quantidade),
                  (index, roloId) => handleRoloChange(grupo.id, index, roloId),
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
                      Adicionar item da cor
                    </Button>
                    <DataTable
                      columns={gradeEditColumns}
                      data={rows}
                      isLoading={false}
                    />
                  </section>
                );
              })}
            </div>
          )}

          <Button
            type="button"
            onClick={handleAdicionarItens}
            className="mt-4"
            disabled={Object.values(gradeRowsByCor).every((rows) => rows.length === 0)}
          >
            Salvar
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div >
      )}
    </>
  );
};