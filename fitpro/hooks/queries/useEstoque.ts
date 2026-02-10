import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { EstoqueTecido, MovimentacaoEstoque, PaginatedResponse } from '@/types/production';

// ============ TIPOS ============




interface RelatorioEstoque {
    totalRolos: number;
    pesoTotal: number;
    tecidoComMaiorEstoque: string;
    rolosDisponíveis: number;
    rolosReservados: number;
    rolosEmUso: number;
    movimentacoesMes: number;
}

interface EstoqueTecidoListResponse {
    data: EstoqueTecido[];
    pagination: PaginatedResponse;
}

interface MovimentacaoEstoqueListResponse {
    data: MovimentacaoEstoque[];
    pagination: PaginatedResponse;
}

// ============ ESTOQUE ROLOS ============

export const useEstoqueTecidos = (filtros?: { tecidoId?: string; situacao?: string }) => {
    return useQuery({
        queryKey: ['estoque-rolos', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.tecidoId) params.append('tecidoId', filtros.tecidoId);
            if (filtros?.situacao) params.append('situacao', filtros.situacao);

            const queryString = params.toString();
            const { data } = await apiClient.get<EstoqueTecido[] | EstoqueTecidoListResponse>(
                `/estoque-rolos${queryString ? `?${queryString}` : ''}`
            );
            return Array.isArray(data) ? data : data.data;
        },
    });
};

export const useEstoqueTecido = (id: string) => {
    return useQuery({
        queryKey: ['estoque-rolos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<EstoqueTecido>(`/estoque-rolos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarEstoqueTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            tecidoId: string;
            codigoBarraRolo: string;
            pesoInicialKg: number;
            pesoAtualKg: number;
            situacao: 'disponivel' | 'reservado' | 'em_uso' | 'descartado';
        }) => {
            const { data } = await apiClient.post<EstoqueTecido>('/estoque-rolos', dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            toast.success('Rolo adicionado ao estoque com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao adicionar rolo ao estoque');
        },
    });
};

interface AtualizarEstoqueTecidoBody {
    pesoAtualKg: number;
    situacao: "disponivel" | "reservado" | "em_uso" | "descartado";
}

export const useAtualizarEstoqueTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: { id: string; } & AtualizarEstoqueTecidoBody) => {
            const { data } = await apiClient.put<EstoqueTecido>(`/estoque-rolos/${id}`, dados);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos', data.id] });
            toast.success('Rolo atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao atualizar rolo');
        },
    });
};

export const useDeletarEstoqueTecido = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/estoque-rolos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            toast.success('Rolo deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar rolo');
        },
    });
};

export const useRelatorioEstoque = () => {
    return useQuery({
        queryKey: ['estoque-rolos', 'relatorio', 'geral'],
        queryFn: async () => {
            const { data } = await apiClient.get<RelatorioEstoque>(
                '/estoque-rolos/relatorio/geral'
            );
            return data;
        },
    });
};

// ============ MOVIMENTAÇÕES DE ESTOQUE ============

export const useMovimentacoesEstoque = (filtros?: {
    EstoqueTecidoId?: string;
    tipoMovimentacao?: string;
    dataInicio?: string;
    dataFim?: string;
}) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.EstoqueTecidoId) params.append('EstoqueTecidoId', filtros.EstoqueTecidoId);
            if (filtros?.tipoMovimentacao) params.append('tipoMovimentacao', filtros.tipoMovimentacao);
            if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
            if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);

            const queryString = params.toString();
            const { data } = await apiClient.get<MovimentacaoEstoque[] | MovimentacaoEstoqueListResponse>(
                `/movimentacoes-estoque${queryString ? `?${queryString}` : ''}`
            );
            return Array.isArray(data) ? data : data.data;
        },
    });
};

export const useMovimentacaoEstoque = (id: string) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', id],
        queryFn: async () => {
            const { data } = await apiClient.get<MovimentacaoEstoque>(
                `/movimentacoes-estoque/${id}`
            );
            return data;
        },
        enabled: !!id,
    });
};

interface MovimentacaoHistoricoParams {
    usuarioId: string;
}

export const useCriarMovimentacaoEstoque = ({ usuarioId }: MovimentacaoHistoricoParams) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['movimentacao-estoque', 'criar'],
        mutationFn: async (dados: {
            EstoqueTecidoId: string;
            tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
            pesoMovimentado: number;
        }) => {
            const { data } = await apiClient.post<MovimentacaoEstoque>(
                `/movimentacoes-estoque/${usuarioId}`,
                dados
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos'] });
            queryClient.invalidateQueries({ queryKey: ['estoque-rolos', 'relatorio', 'geral'] });
            toast.success('Movimentação registrada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao registrar movimentação');
        },
    });
};

export const useHistoricoRolo = (EstoqueTecidoId: string) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', EstoqueTecidoId, 'historico'],
        queryFn: async () => {
            const { data } = await apiClient.get(
                `/movimentacoes-estoque/${EstoqueTecidoId}/historico`
            );
            return data;
        },
        enabled: !!EstoqueTecidoId,
    });
};
