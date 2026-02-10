import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { Faccao, LoteProducao, PaginatedResponse } from '@/types/production';

// ============ TIPOS ============

// Re-export types from production to keep them in sync
import { LoteProducao as LoteProd, ItemsLoteProducao, Direcionamento as DirProd, Produto, Tamanho } from '@/types/production';



interface Direcionamento {
    id: string;
    loteProducaoId: string;
    faccaoId?: string;
    tipoServico: string;
    dataSaida: string;
    dataPrevisaoRetorno?: string;
    status: 'enviado' | 'em_producao' | 'atrasado' | 'concluido' | '';
    createdAt?: string;
    updatedAt?: string;
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
            toast.error(error.response?.data?.error|| 'Erro ao criar facção');
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
            toast.error(error.response?.data?.error|| 'Erro ao atualizar facção');
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
            toast.error(error.response?.data?.error|| 'Erro ao deletar facção');
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
            const { data } = await apiClient.get<{ data: LoteProducao[]; pagination: PaginatedResponse }>(
                `/lotes-producao${queryString ? `?${queryString}` : ''}`
            );
            return data as { data: LoteProducao[]; pagination: PaginatedResponse };
        },
    });
};

export const useLoteProducao = (id: string) => {
    return useQuery({
        queryKey: ['lotes-producao', id],
        queryFn: async () => {
            const { data } = await apiClient.get<LoteProducao>(`/lotes-producao/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            codigoLote: string;
            tecidoId: string;
            responsavelId: string;
            status: 'planejado' | 'em_producao' | 'concluido' | 'cancelado';
            observacao?: string;
            items: Array<{
                produtoId: string;
                tamanhoId: string;
                quantidadePlanejada: number;
            }>,
            rolos?: Array<{
                estoqueRoloId: string
                pesoReservado: number
                }>;
        }) => {
            const { data } = await apiClient.post<LoteProducao>('/lotes-producao', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Lote de produção criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao criar lote de produção');
        },
    });
};

export const useAtualizarLoteProducao = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<LoteProducao>(`/lotes-producao/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao', data.id] });
            toast.success('Lote de produção atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao atualizar lote de produção');
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
            toast.error(error.response?.data?.error|| 'Erro ao deletar lote de produção');
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
            const { data } = await apiClient.get<Direcionamento[]>(
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
            const { data } = await apiClient.get<Direcionamento>(`/direcionamentos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            loteProducaoId: string;
            faccaoId: string;
            tipoServico:
            | 'costura'
            | 'estampa'
            | 'tingimento'
            | 'acabamento'
            | 'corte'
            | 'outro';
            dataSaida: string;
            dataPrevisaoRetorno: string;
        }) => {
            const { data } = await apiClient.post<Direcionamento>('/direcionamentos', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['lotes-producao'] });
            toast.success('Direcionamento criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error|| 'Erro ao criar direcionamento');
        },
    });
};

export const useAtualizarDirecionamento = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<Direcionamento>(
                `/direcionamentos/${id}`,
                dados
            );
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['direcionamentos'] });
            queryClient.invalidateQueries({ queryKey: ['direcionamentos', data.id] });
            toast.success('Direcionamento atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error|| 'Erro ao atualizar direcionamento');
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
            toast.error(error.response?.data?.error|| 'Erro ao deletar direcionamento');
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
            statusQualidade: 'conforme' | 'nao_conforme' | 'com_defeito';
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
            toast.error(error.response?.data?.error|| 'Erro ao criar conferência');
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
            toast.error(error.response?.data?.error|| 'Erro ao atualizar conferência');
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
            toast.error(error.response?.data?.error|| 'Erro ao deletar conferência');
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
