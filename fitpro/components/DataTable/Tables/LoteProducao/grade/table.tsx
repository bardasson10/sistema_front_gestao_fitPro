"use client";
import React, { useState, useMemo } from "react";
import { GradeProduto, Produto, Tamanho } from "@/types/production";
import { DataTable } from "@/components/DataTable";
import { getGradeDetalhadaColumns } from "./columns";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const LoteProducaoTableGrade: React.FC<{
  produtos: Produto[],
  tamanhos: Tamanho[],
  isLoading?: boolean,
  viewOnRemove?: boolean,
  isEditing?: boolean
}> = ({ produtos = [], tamanhos = [], isLoading, viewOnRemove, isEditing = true }) => {
  const { control } = useFormContext<LoteProducaoFormValues>();
  const { fields, remove, append } = useFieldArray({ control, name: "grade" });

  const [novoItem, setNovoItem] = useState({
    produto: "", gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0
  });

  // Visibilidade baseada nos tamanhos ativos da API
  const columnVisibility = useMemo(() => {
    if (!tamanhos || tamanhos.length === 0) {
      return {
        gradePP: true,
        gradeP: true,
        gradeM: true,
        gradeG: true,
        gradeGG: true,
      };
    }
    const nomesAtivos = tamanhos.map(t => `grade${t.nome}`);
    return {
      gradePP: nomesAtivos.includes('gradePP'),
      gradeP: nomesAtivos.includes('gradeP'),
      gradeM: nomesAtivos.includes('gradeM'),
      gradeG: nomesAtivos.includes('gradeG'),
      gradeGG: nomesAtivos.includes('gradeGG'),
    };
  }, [tamanhos]);

  const handleAddItem = () => {
    const p = produtos.find(prod => prod.id === novoItem.produto);
    if (!p) return;

    append({
      id: crypto.randomUUID(),
      produtoId: p.id,
      produto: p.nome,
      gradePP: novoItem.gradePP,
      gradeP: novoItem.gradeP,
      gradeM: novoItem.gradeM,
      gradeG: novoItem.gradeG,
      gradeGG: novoItem.gradeGG,
      total: novoItem.gradePP + novoItem.gradeP + novoItem.gradeM + novoItem.gradeG + novoItem.gradeGG
    });
    setNovoItem({ produto: "", gradePP: 0, gradeP: 0, gradeM: 0, gradeG: 0, gradeGG: 0 });
  };

  const columns = useMemo(() => getGradeDetalhadaColumns(viewOnRemove, remove, isEditing), [viewOnRemove, remove, isEditing]);

  return (
    <div className="w-full space-y-4">
      <DataTable
        columns={columns}
        data={fields as unknown as GradeProduto[]}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
      />

      {isEditing && (
        <div className="flex flex-wrap items-end gap-3 p-4 border rounded-lg bg-muted/30">
          <div className="flex-1 min-w-50 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Produto</span>
            <Select value={novoItem.produto} onValueChange={(v) => setNovoItem({...novoItem, produto: v})}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {produtos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {['gradePP', 'gradeP', 'gradeM', 'gradeG', 'gradeGG'].map(key => (
            columnVisibility[key as keyof typeof columnVisibility] && (
              <div key={key} className="space-y-1">
                <span className="text-xs font-medium block text-center uppercase">{key.replace('grade','')}</span>
                <Input
                  type="number" className="h-9 w-14 text-center"
                  value={(novoItem as any)[key] || ''}
                  onChange={(e) => setNovoItem({...novoItem, [key]: Number(e.target.value)})}
                />
              </div>
            )
          ))}
          <Button type="button" onClick={handleAddItem} disabled={!novoItem.produto} className="h-9"><Plus className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
};