
"use client";
import React, { useState } from "react";
import { GradeProduto, Produto, Tamanho } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getGradeDetalhadaColumns } from "./columns";
import { SemDadosComponent } from "@/components/ErrorManagementComponent/AnyData";
import { LoteProducaoGradeProps } from "@/types/LoteProduComponents/loteProducao-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface LoteProducaoGradeTableProps extends LoteProducaoGradeProps {
  isViewComponent?: boolean;
  produtos?: Produto[];
  tamanhos?: Tamanho[];
  isEditing?: boolean;
}

export const LoteProducaoTableGrade: React.FC<LoteProducaoGradeTableProps> = ({
  grade,
  isLoading,
  isViewComponent,
  viewOnRemove,
  produtos = [],
  tamanhos = [],
  isEditing = true,
}) => {
  const { control } = useFormContext<LoteProducaoFormValues>();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "grade",
  });

  const [novoItem, setNovoItem] = useState({
    produto: "",
    gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0
  });

  const handleAddItem = () => {
    if (!novoItem.produto) return;

    // Buscar o produto selecionado para pegar o nome
    const produtoSelecionado = produtos.find(p => p.id === novoItem.produto);
    if (!produtoSelecionado) return;

    const totalCalculado =
      Number(novoItem.gradePP) +
      Number(novoItem.gradeP) +
      Number(novoItem.gradeM) +
      Number(novoItem.gradeG) +
      Number(novoItem.gradeGG);

    append({
      id: crypto.randomUUID(),
      produtoId: novoItem.produto,
      produto: produtoSelecionado.nome,
      gradePP: Number(novoItem.gradePP),
      gradeP: Number(novoItem.gradeP),
      gradeM: Number(novoItem.gradeM),
      gradeG: Number(novoItem.gradeG),
      gradeGG: Number(novoItem.gradeGG),
      total: totalCalculado
    });

    setNovoItem({ produto: "", gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0 });
  };

  const columns = React.useMemo(
    () => getGradeDetalhadaColumns(viewOnRemove, remove, isEditing),
    [viewOnRemove, remove, isEditing]
  );


  return (
    <div className="w-full">
      {isViewComponent && <SemDadosComponent<GradeProduto> nomeDado="lote de produção" data={grade} />}
      <DataTable
        columns={columns}
        data={fields as unknown as GradeProduto[]}
        isLoading={isLoading}
        getRowId={(row) => row.id}
      />
      {viewOnRemove && (
        <div className="flex flex-wrap items-center gap-3 p-4 border border-dashed rounded-lg bg-muted/40 mt-4">

          <div className="flex-1 min-w-45 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground ml-1">Produto</span>
            <Select
              value={novoItem.produto}
              onValueChange={(val) => setNovoItem({ ...novoItem, produto: val })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-background h-9 w-full shadow-sm" disabled={!isEditing || produtos.length === 0}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {produtos && produtos.length > 0 ? (
                  produtos.map(p => (
                    <SelectItem key={p.id} value={p.id} className="capitalize">
                      {p.nome} ({p.sku})
                    </SelectItem>
                  ))
                ) : null}
              </SelectContent>
              {(!produtos || produtos.length === 0) && (
                <div className="p-2 text-xs text-muted-foreground text-center mt-2">
                  Nenhum produto disponível
                </div>
              )}
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
                disabled={!isEditing}
                className="bg-background h-9 w-14 text-center px-1 shadow-sm transition-all focus:w-16 disabled:opacity-50"
                value={(novoItem as any)[key] === 0 ? '' : (novoItem as any)[key]}
                onChange={(e) => setNovoItem({ ...novoItem, [key]: Number(e.target.value) })}
              />
            </div>
          ))}

          <Button
            type="button"
            onClick={handleAddItem}
            disabled={!novoItem.produto || !isEditing}
            className="h-9 px-4 shadow-sm flex items-end mt-5"
          >
            <Plus className="h-4 w-4 " />
          </Button>
        </div>
      )}

    </div>
  );
};