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
    valorTecido?: number;
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
    statusQualidade: 'recebido' | 'em_conferencia' | 'aprovado' | 'aprovado_parcial' | 'aprovado_defeito';
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
            const response = await apiClient.get<{ data: Faccao[], pagination: PaginatedResponse }>(`/faccoes${queryString}`);
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

export interface ILotesProducaoFiltros {
    status?: string;
    codigoLote?: string;
    responsavelId?: string;
    corId?: string;
    produtoId?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
}

export const useLotesProducao = (filtros?: Partial<ILotesProducaoFiltros>) => {
    return useQuery({
        queryKey: ['lotes-producao', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.status) params.append('status', filtros.status);
            if (filtros?.codigoLote) params.append('codigoLote', filtros.codigoLote);
            if (filtros?.responsavelId) params.append('responsavelId', filtros.responsavelId);
            if (filtros?.corId) params.append('corId', filtros.corId);
            if (filtros?.produtoId) params.append('produtoId', filtros.produtoId);
            if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
            if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
            if (typeof filtros?.page === 'number' && filtros.page > 0) params.append('page', String(filtros.page));
            if (typeof filtros?.limit === 'number' && filtros.limit > 0) params.append('limit', String(filtros.limit));

            const queryString = params.toString();
            const { data } = await apiClient.get<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>(
                `/lotes-producao${queryString ? `?${queryString}` : ''}`
            );
            return data as { data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse };
        },
    });
};

export const useLotesProducaoCompleto = (filtros?: Partial<ILotesProducaoFiltros>) => {
    return useQuery({
        queryKey: ['lotes-producao', 'list-all', filtros],
        queryFn: async () => {
            const pageSize = typeof filtros?.limit === 'number' && filtros.limit > 0 ? filtros.limit : 100;

            const paramsFirstPage = new URLSearchParams();
            if (filtros?.status) paramsFirstPage.append('status', filtros.status);
            if (filtros?.codigoLote) paramsFirstPage.append('codigoLote', filtros.codigoLote);
            if (filtros?.responsavelId) paramsFirstPage.append('responsavelId', filtros.responsavelId);
            if (filtros?.corId) paramsFirstPage.append('corId', filtros.corId);
            if (filtros?.produtoId) paramsFirstPage.append('produtoId', filtros.produtoId);
            if (filtros?.dataInicio) paramsFirstPage.append('dataInicio', filtros.dataInicio);
            if (filtros?.dataFim) paramsFirstPage.append('dataFim', filtros.dataFim);
            paramsFirstPage.append('page', '1');
            paramsFirstPage.append('limit', String(pageSize));

            const firstQueryString = paramsFirstPage.toString();
            const { data: firstPage } = await apiClient.get<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>(
                `/lotes-producao${firstQueryString ? `?${firstQueryString}` : ''}`
            );

            const totalPages = Math.max(firstPage?.pagination?.pages || 1, 1);
            if (totalPages === 1) {
                return firstPage;
            }

            const pageRequests: Promise<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>[] = [];

            for (let page = 2; page <= totalPages; page += 1) {
                const paramsPage = new URLSearchParams();
                if (filtros?.status) paramsPage.append('status', filtros.status);
                if (filtros?.codigoLote) paramsPage.append('codigoLote', filtros.codigoLote);
                if (filtros?.responsavelId) paramsPage.append('responsavelId', filtros.responsavelId);
                if (filtros?.corId) paramsPage.append('corId', filtros.corId);
                if (filtros?.produtoId) paramsPage.append('produtoId', filtros.produtoId);
                if (filtros?.dataInicio) paramsPage.append('dataInicio', filtros.dataInicio);
                if (filtros?.dataFim) paramsPage.append('dataFim', filtros.dataFim);
                paramsPage.append('page', String(page));
                paramsPage.append('limit', String(pageSize));

                const queryString = paramsPage.toString();

                pageRequests.push(
                    apiClient
                        .get<{ data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse }>(
                            `/lotes-producao${queryString ? `?${queryString}` : ''}`
                        )
                        .then((response) => response.data)
                );
            }

            const remainingPages = await Promise.all(pageRequests);

            const mergedData = [
                ...(firstPage.data || []),
                ...remainingPages.flatMap((pageResult) => pageResult.data || []),
            ];

            return {
                ...firstPage,
                data: mergedData,
                pagination: {
                    ...firstPage.pagination,
                    page: 1,
                    pages: 1,
                    limit: mergedData.length,
                    total: mergedData.length,
                },
            } as { data: ApiLoteProducaoResponse[]; pagination: PaginatedResponse };
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
