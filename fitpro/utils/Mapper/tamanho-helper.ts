import { ItemLote } from "@/components/DataTable/Tables/LoteProducao/grade/table";

export interface GradeRow {
  produtoId: string;
  produtoNome: string;
  tamanhos: Record<string, number>;
}

export function mapToGrade(items: ItemLote[]): GradeRow[] {
  const grouped: Record<string, GradeRow> = {};

  items.forEach((item) => {
    const produtoId = item.produto.id;
    const produtoNome = item.produto.nome;
    const tamanho = item.tamanho.nome;
    const quantidade = item.quantidadePlanejada;

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

  const valorMapeado  = Object.values(grouped);

  console.log("Valor mapeado para grade:", valorMapeado);

  return valorMapeado;
}