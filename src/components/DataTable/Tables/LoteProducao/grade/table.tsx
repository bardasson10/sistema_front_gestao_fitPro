"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { GradeEditableRow, getGradeDetalhadaColumns } from "./columns";
import { useFormContext } from "react-hook-form";
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
  pesoAtualKg: string;
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

  const { setValue, watch } = useFormContext();
  const rolosSelecionados = (watch("tecido.rolos.itens") || []) as RoloSelecionado[];
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

    return Array.from(grouped.values());
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
    const itemsPayload: Array<{
      produtoId: string;
      tamanhoId: string;
      quantidadePlanejada: number;
      corId: string;
      rolos: Array<{
        estoqueRoloId: string;
        pesoReservado: number;
      }>;
    }> = [];

    Object.entries(gradeRowsByCor).forEach(([corId, rows]) => {
      rows.forEach((row) => {
        tamanhos.forEach((tamanho) => {
          const quantidadePlanejada = Number(row.tamanhos[tamanho.id] ?? 0);
          if (!quantidadePlanejada || quantidadePlanejada <= 0 || !row.produtoId || !tamanho.id) {
            return;
          }

          const roloAtual = rolosSelecionados.find((rolo) => rolo.id === row.roloId);

          itemsPayload.push({
            produtoId: row.produtoId,
            tamanhoId: tamanho.id,
            quantidadePlanejada,
            corId: corId === SEM_COR_ID ? roloAtual?.corId || "" : corId,
            rolos: row.roloId
              ? [
                  {
                    estoqueRoloId: row.roloId,
                    pesoReservado: 0, // placeholder, será calculado abaixo
                  },
                ]
              : [],
          });
        });
      });
    });

    // Agrupar itens por roloId para distribuir peso
    const itensPorRolo = new Map<string, typeof itemsPayload>();
    itemsPayload.forEach((item) => {
      const roloId = item.rolos[0]?.estoqueRoloId;
      if (!roloId) return;

      if (!itensPorRolo.has(roloId)) {
        itensPorRolo.set(roloId, []);
      }
      itensPorRolo.get(roloId)!.push(item);
    });

    // Distribuir peso do rolo entre os itens que o usam
    itensPorRolo.forEach((itensDoRolo, roloId) => {
      const rolo = rolosSelecionados.find((r) => r.id === roloId);
      if (!rolo) return;

      const pesoTotal = Number(rolo.pesoAtualKg || 0);
      
      if (itensDoRolo.length === 0) return;
      
      const pesoPorItem = Number((pesoTotal / itensDoRolo.length).toFixed(2));
      let pesoAcumulado = 0;

      itensDoRolo.forEach((item, index) => {
        if (item.rolos[0]) {
          if (index === itensDoRolo.length - 1) {
            // Último item recebe a diferença para garantir exatidão
            item.rolos[0].pesoReservado = Number((pesoTotal - pesoAcumulado).toFixed(2));
          } else {
            item.rolos[0].pesoReservado = pesoPorItem;
            pesoAcumulado += pesoPorItem;
          }
        }
      });
    });

    const serializedPayload = JSON.stringify(itemsPayload);
    if (serializedPayload === lastItemsPayloadRef.current) {
      return;
    }

    lastItemsPayloadRef.current = serializedPayload;
    setValue("items", itemsPayload, { shouldDirty: true });
  }, [isGradeEditMode, gradeRowsByCor, rolosSelecionados, setValue, tamanhos]);

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