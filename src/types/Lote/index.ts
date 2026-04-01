// ------------------------------------------ / INTERFACE RESPONSE / ---------------------------------------------------------- //

interface Responsavel {
    id: string;
    nome: string;
    perfil: string;
    status: string;
    funcaoSetor: string;
}


interface MaterialRolo {
    id: string;
    codigoBarraRolo?: string;
    pesoAtualKg?: number;
    pesoReservado?: number;
    situacao?: string;
}

interface MaterialCor {
    corId?: string;
    nome?: string;
    codigoHex?: string;
    qtdFolhas?: number;
    valorTecido?: number;
    rolos?: MaterialRolo[];
    gradeLote?: GradeItem[];
}

interface Material {
    tecidoId?: string;
    nome?: string;
    codigoReferencia?: string;
    rendimentoMetroKg?: number;
    larguraMetros?: number;
    gramatura?: number;
    valorPorKg?: number;
    pesoTotal?: number;
    cores?: MaterialCor[];
}

interface Tamanho {
    id: string;
    nome: string;
    ordem: number;
}

export interface Produto {
    id: string;
    tipoProdutoId: string;
    nome: string;
    sku: string;
    fabricante: string;
    custoMedioPeca: string;
    precoMedioVenda: string;
    createdAt: string;
    updatedAt: string;
}
interface GradeItem {
    id?: string;
    loteProducaoId?: string;
    produtoId?: string;
    tamanhoId?: string;
    quantidadePlanejada?: number;
    qtdMultiplicadorGrade?: number;
    produtoNome?: string;
    sku?: string;
    tamanhoNome?: string;
    produto?: Produto;
    tamanho?: Tamanho;
}

interface Direcionamento {
    id: string;
    faccaoId: string;
    tipoServico: string;
    status: string;
    dataPrevisaoRetorno: string;
}

interface LoteProducaoEnfesto {
    id: string;
    cor: string;
    qtdFolhas: number;
    rolos: {
        estoqueRoloId: string;
    }[];
}
export interface ILoteResponse {
    id: string;
    codigoLote: string;
    tecidoId?: string;
    status: TStatusLote;
    observacao?: string;
    createdAt: string;
    updatedAt: string;
    responsavel?: Partial<Responsavel>;
    materiais?: Material[];
    direcionamentos?: Direcionamento[];
    enfestos?: LoteProducaoEnfesto[];
}

export interface IResumoPorCorLinha {
    tamanhoId: string;
    tamanhoNome: string;
    tamanhoOrdem: number;
    quantidade: number;
}

export interface IResumoPorCorProduto {
    id: string;
    nome: string;
    sku: string;
    linhas: IResumoPorCorLinha[];
    total: number;
}

export interface IResumoPorCorTamanhoTotal {
    id: string;
    nome: string;
    ordem: number;
    total: number;
}

export interface IResumoPorCorSecao {
    produtos: IResumoPorCorProduto[];
    tamanhos: IResumoPorCorTamanhoTotal[];
    grandTotal: number;
}

export interface IResumoPorCorItem {
    id: string;
    nome: string;
    codigoHex: string;
    produtos: IResumoPorCorProduto[];
    tamanhos: IResumoPorCorTamanhoTotal[];
    total: number;
}

export interface IResumoPorCorResponse {
    totalGeral: IResumoPorCorSecao;
    cores: IResumoPorCorItem[];
}

// ------------------------------------------ / INTERFACE PAYLOADS / ---------------------------------------------------------- //


export interface IRequestBodyCreateLote {
    codigoLote: string;
    responsavelId: string;
    status: TStatusLote;
    observacao?: string;
    rolos: Array<{
        estoqueRoloId: string;
        pesoReservado: number;
    }>;
}



export interface IRequestBodyAddItensLote {
    corId: string;
    qtdFolhas: number;
    rolosProducao: Array<{
        estoqueRoloId: string
    }>;
    itens: Array<{
        produtoId: string;
        tamanhoId: string;
        qtdMultiplicadorGrade: number;
    }>;
}

export interface IRequestBodyAddRolosLote {
    rolosProducao: Array<{
        estoqueRoloId: string,
        pesoReservado: number
    }>;
}



export interface IRequestBodyUpdateLote {
    codigoLote?: string;
    responsavelId?: string;
    status?: TStatusLote;
    observacao?: string;
    gradeItens?: Array<{
        produtoId: string;
        tamanhoId: string;
        qtdMultiplicadorGrade: number;
    }>;
    enfestos?: Array<{
        qtdFolhas?: number;
        corId?: string;
        rolosProducao?: Array<{
            estoqueRoloId: string,
            pesoReservado: number
        }>;
    }>
}



// ------------------------------------------ / TYPES / ---------------------------------------------------------- //


export type TStatusLote = 'lote_criado' | 'enfesto' | 'cortado';
export type TStatusLoteFilter = 'lote_criado' | 'enfesto' | 'cortado' | 'todos';



// ------------------------------------------ / CONSTANTES / ---------------------------------------------------------- //

export const STATUS_LOTE_OPTIONS: Record<TStatusLote, string> = {
    lote_criado: 'Lote Criado',
    enfesto: 'Enfesto',
    cortado: 'Cortado',
};

export const STATUS_LOTE_OPTIONS_FILTER: Record<TStatusLoteFilter, string> = {
    todos: 'Todos',
    lote_criado: 'Lote Criado',
    enfesto: 'Enfesto',
    cortado: 'Cortado',
};


