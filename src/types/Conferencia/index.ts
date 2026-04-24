
export interface ConferenciaResponsavel {
    id: string
    nome: string
}

export type ConferenciaStatusQualidade =
    | 'recebido'
    | 'em_conferencia'
    | 'aprovado'
    | 'aprovado_parcial'
    | 'aprovado_defeito'

export interface ConferenciaPagamentoPorSku {
    sku: string
    quantidadeRecebida: number
    quantidadeAprovada: number
    valorUnitario: number
    subtotal: number
}

export interface ConferenciaPagamentoResumo {
    totalCalculado: number
    valorPago: number
    valorAPagar: number
    porSku: ConferenciaPagamentoPorSku[]
}

export interface ConferenciaDirecionamento {
    id: string
    tipoServico: string
    status: string
    dataSaida: string
    faccao: {
        id: string
        nome: string
    }
}

export interface ConferenciaItem {
    id: string
    direcionamentoItemId: string
    quantidadeEnviada: number
    qtdRecebida: number
    qtdDefeito: number
    quebra: number
    produto: {
        id: string
        nome: string
        sku: string
    }
    tamanho: string
    cor: {
        nome: string
        codigoHex: string
    }
    lote: string
    pagamento?: ConferenciaPagamentoResumo
}


export interface Conferencia {
    id: string
    dataConferencia: string
    statusQualidade: ConferenciaStatusQualidade
    observacao: string | null
    liberadoPagamento: boolean
    isProducaoInterna?: boolean
    pagamento?: ConferenciaPagamentoResumo
    responsavel: ConferenciaResponsavel
    direcionamento: ConferenciaDirecionamento
    items: ConferenciaItem[]
}



export interface ConferenciaItemPayload {
    direcionamentoItemId: string
    qtdRecebida: number
    qtdDefeito: number
}

export interface IProdutosSKU {
    sku: string
    valorFaccaoPorPeca: number
}


export interface ConferenciaRequestBodyPayload {
    direcionamentoId: string
    responsavelId: string
    dataConferencia: string
    statusQualidade: ConferenciaStatusQualidade
    produtoSKU: IProdutosSKU[]
    liberadoPagamento: boolean
    observacao: string
    items: ConferenciaItemPayload[]
}

export interface ConferenciaUpdateRequestBodyPayload {
    direcionamentoId?: string
    responsavelId: string
    dataConferencia: string
    statusQualidade: ConferenciaStatusQualidade
    produtoSKU: IProdutosSKU[]
    liberadoPagamento: boolean
    observacao: string
    items: ConferenciaItemPayload[]
}