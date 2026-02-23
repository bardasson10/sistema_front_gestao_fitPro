"use client";

import { useEffect, useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { getGradeDetalhadaColumns } from "./columns";
import { useFieldArray, useFormContext } from "react-hook-form";
import { mapToGrade } from "@/utils/Mapper/tamanho-helper";
import { getAdicionarProdutoColumns } from "../../AddGrade/columns";
import { NovoItemRow } from "../../AddGrade/type-input-new-line";
import { useProdutos } from "@/hooks/queries/useProdutos";
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
  produto?: Produto;
  tamanho?: Tamanho;
  quantidadePlanejada: number;
}

export const LoteProducaoTableGrade = ({
  itensLote,
  isFormEditable = false,
  isGradeEditMode = false,
  handleAdicionarItens

}: {
  itensLote: ItemLote[];
  isFormEditable?: boolean;
  isGradeEditMode?: boolean;
  handleAdicionarItens: () => void
}) => {

  const { data: produtosData } = useProdutos();
  const produtos = produtosData?.data || [];

  const { control } = useFormContext();

  const { remove, fields, append, replace } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    if (!isGradeEditMode) return;
    if (fields.length > 0) return;
    if (itensLote.length > 0) return;
    if (produtos.length === 0) return;

    replace(
      produtos.map((produto) => ({
        produtoId: produto.id,
        tamanhoId: "",
        quantidadePlanejada: 1,
      }))
    );
  }, [isGradeEditMode, fields.length, itensLote.length, produtos, replace]);

  const gradeData = useMemo(
    () => mapToGrade(itensLote),
    [itensLote]
  );

  const itensParaAdicionar = useMemo(
    () => fields.map((field) => ({ ...field })) as unknown as NovoItemRow[],
    [fields]
  );

  const tamanhos = useMemo(() => {
    const unique = new Set<string>();

    gradeData.forEach((row) => {
      Object.keys(row.tamanhos).forEach((nomeTamanho) => unique.add(nomeTamanho));
    });

    return Array.from(unique).map((nome) => ({ nome, quantidade: 0 }));
  }, [gradeData]);



  const columns = useMemo(
    () =>
      getGradeDetalhadaColumns(
        tamanhos,
        remove,
        isFormEditable
      ),
    [tamanhos, remove, isFormEditable]
  );

  const novosProdutos = useMemo(
    () =>
      getAdicionarProdutoColumns(
        produtos,
        remove
      ),
    [produtos, remove]
  );

  return (

    <>
      {!isGradeEditMode ? (
        <DataTable
          columns={columns}
          data={gradeData}
          isLoading={false}
        />
      ) : (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-3"
            onClick={() =>
              append({
                produtoId: "",
                tamanhoId: "",
                quantidadePlanejada: 1,
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar na lista
          </Button>
          <DataTable
            columns={novosProdutos}
            data={itensParaAdicionar}
            isLoading={false}
          />
          <Button type="button" onClick={handleAdicionarItens} className="mt-4" disabled={itensParaAdicionar.length === 0}>
            Salvar
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div >
      )}
    </>
  );
};