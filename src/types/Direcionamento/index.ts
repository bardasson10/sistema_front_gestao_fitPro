import { ServiceFaccao } from "../Faccao"


export interface FaccaoRemessa {
    id: string
    nome: string
    tiposServico: string[]
}

export interface ItemDirecionamento {
    estoqueCorteId: string
    quantidade: number
}

export interface Direcionamento {
    faccaoId: string
    tipoServico: string
    dataSaida: string
    dataPrevisaoRetorno: string
    items: ItemDirecionamento[]
}

export interface DirecionamentoRequestBodyPayload{
    direcionamentos: Direcionamento[]
}

// Types para listagem de remessas
export interface RemessaFaccao {
    id: string
    nome: string
    responsavel: string
}

export interface RemessaProduto {
    id: string
    nome: string
    sku: string
    cor: {
        id: string
        nome: string
        codigoHex: string
    }
    tamanho: string
}

export interface RemessaLote {
    id: string
    codigoLote: string
}

export interface RemessaItem {
    id: string
    quantidade: number
    produto: RemessaProduto
    lote: RemessaLote
}

export interface DirecionamentoRemessa {
    id: string
    status: string
    tipoServico: ServiceFaccao;
    quantidade: number
    dataSaida: string
    dataPrevisaoRetorno: string
    faccao: RemessaFaccao
    items: RemessaItem[]
    createdAt: string
}
