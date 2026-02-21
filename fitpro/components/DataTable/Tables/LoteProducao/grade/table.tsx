"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/DataTable";
import { getGradeDetalhadaColumns } from "./columns";
import { useFieldArray, useFormContext } from "react-hook-form";
import { mapToGrade } from "@/utils/Mapper/tamanho-helper";


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
  id: string;
  produto: Produto;
  tamanho: Tamanho;
  quantidadePlanejada: number;
}

export const LoteProducaoTableGrade = ({
  itensLote,
  isEditing = true
}: {
  itensLote: ItemLote[];
  isEditing?: boolean;
}) => {

  const { control } = useFormContext();

  const { remove } = useFieldArray({
    control,
    name: "items"
  });

  const gradeData = useMemo(
    () => mapToGrade(itensLote),
    [itensLote]
  );

  const tamanhos = useMemo(
    () =>
      Array.from(
        new Set(itensLote.map((i) => ({ nome: i.tamanho.nome, quantidade: i.quantidadePlanejada })))
      ),
    [itensLote]
  );

  const columns = useMemo(
    () =>
      getGradeDetalhadaColumns(
        tamanhos,
        remove,
        isEditing
      ),
    [tamanhos, remove, isEditing]
  );

  return (
    <DataTable
      columns={columns}
      data={gradeData}
      isLoading={false}
    />
  );
};