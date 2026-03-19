export interface ProdutoRemessa {
    id: string
    nome: string
    sku: string
}

export interface TamanhoRemessa {
    id: string
    nome: string
}

export interface Cor {
    id: string
    nome: string
    codigoHex: string
}

export interface TecidoRemessa {
    id: string
    nome: string
}

export interface LoteRemessa {
    id: string
    codigoLote: string
    tecido: TecidoRemessa
}

export interface EstoqueCorte {
    id: string;
    quantidadeDisponivel: number
    produto: ProdutoRemessa
    tamanho: TamanhoRemessa
    cor: Cor
    lote: LoteRemessa
}