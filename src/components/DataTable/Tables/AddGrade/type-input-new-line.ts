export type NovoItemRow = {
  produtoId: string;
  tamanhoId: string;
  quantidadePlanejada: number;
  corId: string;
  Rolos: {
    estoqueRoloId: string;
    pesoReservado: number;
  }[];
};