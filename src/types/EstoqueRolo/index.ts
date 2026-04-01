export type SituacaoRolo = 'disponivel' | 'reservado' | 'em_uso' | 'descartado' | 'esgotado';

interface Cor {
    id: string;
    nome: string;
    codigoHex: string;
    valorTecido?: number;
}

interface Fornecedor {
    id: string;
    nome: string;
    tipo: string;
    contato: string;
    createdAt: string;
    updatedAt: string;
}

interface Tecido {
    id: string;
    fornecedorId: string;
    corId: string;
    nome: string;
    codigoReferencia: string;
    rendimentoMetroKg: string;
    larguraMetros: string;
    valorPorKg: string;
    gramatura: string;
    createdAt: string;
    updatedAt: string;
    fornecedor: Fornecedor;
    cor: Cor;
}

export interface EstoqueRolo {
    id: string;
    tecidoId: string;
    codigoBarraRolo: string;
    pesoInicialKg: string;
    pesoAtualKg: string;
    situacao: SituacaoRolo;
    createdAt: string;
    updatedAt: string;
    tecido: Tecido;
}


export interface IKPIEstoqueRolo {
    totalRolos: number;
    pesoTotal: number;
    valorTotalEstoque: number;
    tecidoComMaiorEstoque: string;
    rolosDisponiveis: number;
    rolosReservados: number;
    rolosEmUso: number;
    movimentacoesMes: number;
}

export interface IResumoEstoqueRolo {
    qtdTotalRolos: number,
    pesoTotalRolos: number,
    valorTotalRolos: number,
    tecido: {
        id: string,
        nome: string,
        codigoReferencia: string,
        cor: {
            id: string,
            nome: string,
            codigoHex: string
        }
    }
}

export interface IFiltroEstoqueRolo {
    estoqueRoloId?: string,
    tipoMovimentacao?: string,
    dataInicio?: string,
    dataFim?: string,
    tecidoId?: string,
    situacao?: string
    fornecedorId?: string,
    page?: number | string,
    limit?: number | string,
}
