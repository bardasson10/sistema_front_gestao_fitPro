import { ItemLote } from "@/hooks/queries/useProducao";


export interface GradeRow {
  produtoId: string;
  produtoNome: string;
  tamanhos: Record<string, number>;
}

export function mapToGrade(items: ItemLote[]): GradeRow[] {
  const grouped: Record<string, GradeRow> = {};

  items.forEach((item) => {
    const produtoId = (item as any)?.produto?.id ?? (item as any)?.produtoId;
    const produtoNome = (item as any)?.produto?.nome ?? produtoId;
    const tamanho = (item as any)?.tamanho?.nome ?? (item as any)?.tamanhoId;
    const quantidade = Number((item as any)?.quantidadePlanejada ?? 0);

    if (!produtoId || !tamanho || quantidade <= 0) {
      return;
    }

    if (!grouped[produtoId]) {
      grouped[produtoId] = {
        produtoId,
        produtoNome,
        tamanhos: {}
      };
    }

    grouped[produtoId].tamanhos[tamanho] =
      (grouped[produtoId].tamanhos[tamanho] || 0) + quantidade;
  });

  return Object.values(grouped);
}