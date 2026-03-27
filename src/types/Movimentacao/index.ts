interface Reponsavel {
    id: string;
    nome: string;
}

interface Cor {
    id: string,
    nome: string,
    codigoHex: string
}

interface Tecido {
    id: string,
    nome: string,
    codigoReferencia: string,
    cor: Cor,
}

interface Fornecedor {
    id: string,
    nome: string,
    tipo: string,
    Tecidos: Tecido,
}

interface Rolo {
    id: string,
    codigoBarraRolo: string,
    pesoInicialKg: number,
    forncedor: Fornecedor,
}


export interface IMovimentacaoEstoque {
    id: string,
    tipoMovimentacao: string,
    pesoMovimentado: number,
    rolo: Rolo,
    reponsavel: Reponsavel,
}
