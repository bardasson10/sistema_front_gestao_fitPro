import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { Faccao, PaginatedResponse } from '@/types/production';
import { DirecionamentoSchema } from '@/types/ProducaoDirecionamento/producao-direcionamento-type';


export interface Fornecedor {
    id: string;
    nome: string;
    tipo: string;
    contato: string;
    createdAt: string;
    updatedAt: string;
}

export interface Cor {
    id: string;
    nome: string;
    codigoHex: string;
}

export interface RoloItem {
    id: string;
    tecidoId: string;
    codigoBarraRolo: string;
    pesoInicialKg: string;
    pesoAtualKg: string;
    situacao: string;
    createdAt: string;
    updatedAt: string;
    pesoReservado: number;
}

export interface Tecido {
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
    rolos: {
        itens: RoloItem[];
    };
    pesoTotal: number;
}

export interface Responsavel {
    id: string;
    nome: string;
    perfil: string;
    status: string;
    funcaoSetor: string;
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

export interface Tamanho {
    id: string;
    nome: string;
    ordem: number;
}

export interface ItemLote {
    id: string;
    loteProducaoId: string;
    produtoId: string;
    tamanhoId: string;
    quantidadePlanejada: number;
    produto: Produto;
    tamanho: Tamanho;
}

interface Direcionamento {
    id: string;
    loteProducaoId: string;
    faccaoId: string;
    tipoServico: string;
    status: string;
    dataSaida: string;
    dataPrevisaoRetorno: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoteProducaoEnfesto {
    id: string;
    cor: string;
    qtdFolhas: number;
    rolos: {
        estoqueRoloId: string;
    }[];
}



export interface LoteProducao {
    id: string;
    codigoLote: string;
    tecidoId: string;
    responsavelId: string;
    status: string;
    observacao: string;
    createdAt: string;
    updatedAt: string;
    tecido: Tecido;
    responsavel: Responsavel;
    items: ItemLote[];
    direcionamentos: Direcionamento[];
    enfestos: LoteProducaoEnfesto[];
}

export interface ApiResponsavel {
    id: string;
    nome: string;
    perfil: string;
    status: string;
    funcaoSetor: string;
}


interface ApiMaterialRolo {
    id: string;
    codigoBarraRolo?: string;
    pesoAtualKg?: number;
    pesoReservado?: number;
    situacao?: string;
}

interface ApiMaterialCor {
    corId?: string;
    nome?: string;
    codigoHex?: string;
    qtdFolhas?: number;
    rolos?: ApiMaterialRolo[];
    gradeLote?: ApiGradeItem[];
}

interface ApiMaterial {
    tecidoId?: string;
    nome?: string;
    codigoReferencia?: string;
    rendimentoMetroKg?: number;
    larguraMetros?: number;
    gramatura?: number;
    valorPorKg?: number;
    pesoTotal?: number;
    cores?: ApiMaterialCor[];
}

interface ApiTamanho {
    id: string;
    nome: string;
    ordem: number;
}

export interface ApiProduto {
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
interface ApiGradeItem {
    id?: string;
    loteProducaoId?: string;
    produtoId?: string;
    tamanhoId?: string;
    quantidadePlanejada?: number;
    qtdMultiplicadorGrade?: number;
    produtoNome?: string;
    sku?: string;
    tamanhoNome?: string;
    produto?: ApiProduto;
    tamanho?: ApiTamanho;
}

interface ApiDirecionamento {
    id: string;
    faccaoId: string;
    tipoServico: string;
    status: string;
    dataPrevisaoRetorno: string;
}

export interface ApiLoteProducaoEnfesto {
    id: string;
    cor: string;
    qtdFolhas: number;
    rolos: {
        estoqueRoloId: string;
    }[];
}
export interface ApiLoteProducaoResponse {
    id: string;
    codigoLote: string;
    tecidoId?: string;
    status: string;
    observacao?: string;
    createdAt: string;
    updatedAt: string;
    responsavel?: Partial<ApiResponsavel>;
    materiais?: ApiMaterial[];
    direcionamentos?: ApiDirecionamento[];
    enfestos?: ApiLoteProducaoEnfesto[];
}


interface ConferenciaItem {
    id: string;
    tamanhoId: string;
    qtdRecebida: number;
    qtdDefeito: number;
    tamanho: any;
}

interface Conferencia {
    id: string;
    direcionamentoId: string;
    responsavelId: string;
    dataConferencia: string;
    statusQualidade: 'conforme' | 'nao_conforme' | 'com_defeito';
    liberadoPagamento: boolean;
    observacao?: string;
    direcionamento: Direcionamento;
    responsavel: any;
    items: ConferenciaItem[];
    createdAt: string;
}

interface RelatorioProdutividade {
    periodo: { inicio: string; fim: string };
    totalConferencias: number;
    conformes: number;
    naoConformes: number;
    comDefeito: number;
    taxaConformidade: string;
    pagasAutorizadas: number;
    porFaccao: Record<string, any>;
}

// ============ FACÇÕES ============

export const useFaccoes = (status?: 'ativo' | 'inativo') => {
    return useQuery({
        queryKey: ['faccoes', status],
        queryFn: async () => {
            const queryString = status ? `?status=${status}` : '';
            const response = await apiClient.get<{ data: Faccao[], pagination: any }>(`/faccoes${queryString}`);
            return response.data.data;
        },
    });
};

export const useFaccao = (id: string) => {
    return useQuery({
        queryKey: ['faccoes', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Faccao>(`/faccoes/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            nome: string;
            responsavel: string;
            contato: string;
            prazoMedioDias: number;
            status: 'ativo' | 'inativo';
        }) => {
            const { data } = await apiClient.post<Faccao>('/faccoes', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            toast.success('Facção criada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useAtualizarFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<Faccao>(`/faccoes/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            queryClient.invalidateQueries({ queryKey: ['faccoes', data.id] });
            toast.success('Facção atualizada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeletarFaccao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/faccoes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faccoes'] });
            toast.success('Facção deletada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};

// ============ LOTES DE PRODUÇÃO ============

export const useLotesProducao = (filtros?: { status?: string; responsavelId?: string }) => {
    return useQuery({
        queryKey: ['lotes-producao', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.status) params.append('status', filtros.status);
            if (filtros?.responsavelId) params.append('responsavelId', filtros.responsavelId);

            const queryString = params.toString();
            const { data } = await apiClient.get<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>(
                `/lotes-producao${queryString ? `?${queryString}` : ''}`
            );
            return data as { data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse };
        },
    });
};

export const useLoteProducao = (id: string) => {
    return useQuery({
        queryKey: ['lotes-producao', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>(`/lotes-producao/${id}`);
            return data as { data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse };
        },
        enabled: !!id,
    });
};

export interface CriarLoteProducaoPayload {
    codigoLote: string;
    responsavelId: string;
    status: string;
    observacao?: string;
    rolos: Array<{
        estoqueRoloId: string;
        pesoReservado: number;
    }>;
}

export const useCriarLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({body}: {body: CriarLoteProducaoPayload}) => {
            const { data } = await apiClient.post<LoteProducao>('/lotes-producao', body);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Lote de produção criado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export interface AdicionarItensLoteProducaoPayload {
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

export const useAdicionarItensLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            enfestos,
        }: {
            id: string;
            enfestos: AdicionarItensLoteProducaoPayload[]
        }) => {
            const { data } = await apiClient.post(
                `/lotes-producao/${id}/items`,
                { enfestos }
            );

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', variables.id] });

            toast.success('Itens adicionados ao lote com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};

export interface AdicionarRolosLoteProducaoPayload {
    rolosProducao: Array<{
        estoqueRoloId: string,
        pesoReservado: number
    }>;
}


export const useAdicionarRolosLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: AdicionarRolosLoteProducaoPayload
        }) => {
            const { data } = await apiClient.post(
                `/lotes-producao/${id}/rolos`,
                { rolos: payload.rolosProducao }
            );

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', variables.id] });

            toast.success('Itens adicionados ao lote com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);;
        },
    });
};



export interface AtualizarLoteProducaoPayload {
    codigoLote?: string;
    responsavelId?: string;
    status?: string;
    observacao?: string;
    enfestos?: Array<{
        qtdFolhas?: number;
        corId?: string;
        rolosProducao?: Array<{
            estoqueRoloId: string,
            pesoReservado: number
        }>;
        itens?: Array<{
            produtoId: string;
            tamanhoId: string;
            qtdMultiplicadorGrade: number;
        }>;
    }>
}

export const useAtualizarLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dados }: { id: string; dados: AtualizarLoteProducaoPayload }) => {
            const { data } = await apiClient.put<LoteProducao>(`/lotes-producao/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', data.id] });
            toast.success('Lote de produção atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeletarLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/lotes-producao/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Lote de produção deletado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

// ============ DIRECIONAMENTOS ============

export const useDirecionamentos = (filtros?: {
    status?: string;
    faccaoId?: string;
}) => {
    return useQuery({
        queryKey: ['direcionamentos', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.status) params.append('status', filtros.status);
            if (filtros?.faccaoId) params.append('faccaoId', filtros.faccaoId);

            const queryString = params.toString();
            const { data } = await apiClient.get<{ data: DirecionamentoSchema[], pagination: PaginatedResponse }>(
                `/direcionamentos${queryString ? `?${queryString}` : ''}`
            );
            return data;
        },
    });
};

export const useDirecionamento = (id: string) => {
    return useQuery({
        queryKey: ['direcionamentos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: DirecionamentoSchema[], pagination: PaginatedResponse }>(`/direcionamentos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

type TypeOfServico = 'costura' | 'estampa' | 'tingimento' | 'acabamento' | 'corte' | 'outro';

export interface CreateDirecionamentoPayload {
    loteProducaoId: string;
    direcionamentos: Array<{
        faccaoId: string;
        tipoServico: TypeOfServico;
        dataSaida?: string;
        dataPrevisaoRetorno?: string;
        items: Array<{
            corId: string;
            produtoId: string;
            tamanhoId: string;
            quantidade: number;
        }>;
    }>;
}

export const useCriarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: CreateDirecionamentoPayload) => {
            const { data } = await apiClient.post<{ data: DirecionamentoSchema[], pagination: PaginatedResponse }>('/direcionamentos', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Direcionamento criado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useAtualizarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: {
            id: string;
            faccaoId?: string;
            tipoServico?:
            | 'costura'
            | 'estampa'
            | 'tingimento'
            | 'acabamento'
            | 'corte'
            | 'outro';
            status?: string;
            dataSaida?: string;
            dataPrevisaoRetorno?: string;
        }) => {
            const { data } = await apiClient.put<Direcionamento>(
                `/direcionamentos/${id}`,
                dados
            );
            return data;
        },
        onSuccess: (data: Direcionamento) => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['direcionamentos', data.id] });
            toast.success('Direcionamento atualizado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeletarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/direcionamentos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            toast.success('Direcionamento deletado com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

// ============ CONFERÊNCIAS ============

export const useConferencias = (filtros?: {
    statusQualidade?: string;
    liberadoPagamento?: boolean;
}) => {
    return useQuery({
        queryKey: ['conferencias', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.statusQualidade) params.append('statusQualidade', filtros.statusQualidade);
            if (filtros?.liberadoPagamento !== undefined)
                params.append('liberadoPagamento', String(filtros.liberadoPagamento));

            const queryString = params.toString();
            const { data } = await apiClient.get<Conferencia[]>(
                `/conferencias${queryString ? `?${queryString}` : ''}`
            );

            console.log('Dados das conferências:', data); // Log para verificar os dados retornados
            return data;
        },
    });
};

export const useConferencia = (id: string) => {
    return useQuery({
        queryKey: ['conferencias', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Conferencia>(`/conferencias/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            direcionamentoId: string;
            responsavelId: string;
            dataConferencia: string;
            statusQualidade: 'conforme' | 'nao_conforme' | 'com_defeito' | 'validando';
            liberadoPagamento: boolean;
            observacao?: string;
            items: Array<{
                tamanhoId: string;
                qtdRecebida: number;
                qtdDefeito: number;
            }>;
        }) => {
            const { data } = await apiClient.post<Conferencia>('/conferencias', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            toast.success('Conferência criada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useAtualizarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<Conferencia>(`/conferencias/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
            queryClient.invalidateQueries({ queryKey: ['conferencias', data.id] });
            toast.success('Conferência atualizada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useDeletarConferencia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/conferencias/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conferencias'] });
            toast.success('Conferência deletada com sucesso!');
        },
        onError: (error: any) => {
            const mensagem = error.response?.data?.details?.[0]?.mensage ||
                error.response?.data?.error
            toast.error(mensagem);
        },
    });
};

export const useRelatorioProdutividade = (dataInicio?: string, dataFim?: string) => {
    return useQuery({
        queryKey: ['conferencias', 'relatorio', 'produtividade', dataInicio, dataFim],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);

            const queryString = params.toString();
            const { data } = await apiClient.get<RelatorioProdutividade>(
                `/conferencias/relatorio/produtividade${queryString ? `?${queryString}` : ''}`
            );
            return data;
        },
    });
};
