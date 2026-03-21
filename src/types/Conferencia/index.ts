

export interface ConferenciaResponsavel {
    id: string
    nome: string
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
}

export interface Conferencia {
    id: string
    dataConferencia: string
    statusQualidade: string
    observacao: string | null
    liberadoPagamento: boolean
    responsavel: ConferenciaResponsavel
    direcionamento: ConferenciaDirecionamento
    items: ConferenciaItem[]
}

export interface ConferenciaItemPayload {
    direcionamentoItemId: string
    qtdRecebida: number
    qtdDefeito: number
}

export interface ConferenciaRequestBodyPayload {
    direcionamentoId: string
    responsavelId: string
    dataConferencia: string
    statusQualidade: string
    liberadoPagamento: boolean
    observacao: string
    items: ConferenciaItemPayload[]
}