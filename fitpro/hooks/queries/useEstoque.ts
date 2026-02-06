import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';

// ============ TIPOS ============

interface EstoqueRolo {
    id: string;
    tecidoId: string;
    codigoBarraRolo: string;
    pesoInicialKg: number;
    pesoAtualKg: number;
    situacao: 'disponivel' | 'reservado' | 'em_uso' | 'descartado';
    tecido: any;
    movimentacoes: MovimentacaoEstoque[];
    createdAt: string;
}

interface MovimentacaoEstoque {
    id: string;
    estoqueRoloId: string;
    usuarioId: string;
    tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
    pesoMovimentado: number;
    rolo: EstoqueRolo;
    usuario: any;
    createdAt: string;
}

interface RelatorioEstoque {
    totalRolos: number;
    pesoTotal: number;
    tecidoComMaiorEstoque: string;
    rolosDisponíveis: number;
    rolosReservados: number;
    rolosEmUso: number;
    movimentacoesMes: number;
}

// ============ ESTOQUE ROLOS ============

export const useEstoqueRolos = (filtros?: { tecidoId?: string; situacao?: string }) => {
    return useQuery({
        queryKey: ['estoque-rolos', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.tecidoId) params.append('tecidoId', filtros.tecidoId);
            if (filtros?.situacao) params.append('situacao', filtros.situacao);

            const queryString = params.toString();
            const { data } = await apiClient.get<EstoqueRolo[]>(
                `/estoque-rolos${queryString ? `?${queryString}` : ''}`
            );
            return data;
        },
    });
};

export const useEstoqueRolo = (id: string) => {
    return useQuery({
        queryKey: ['estoque-rolos', id],
        queryFn: async () => {
            const { data } = await apiClient.get<EstoqueRolo>(`/estoque-rolos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarEstoqueRolo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            tecidoId: string;
            codigoBarraRolo: string;
            pesoInicialKg: number;
            pesoAtualKg: number;
            situacao: 'disponivel' | 'reservado' | 'em_uso' | 'descartado';
        }) => {
            const { data } = await apiClient.post<EstoqueRolo>('/estoque-rolos', dados);
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

export const useAtualizarEstoqueRolo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const { data } = await apiClient.put<EstoqueRolo>(`/estoque-rolos/${id}`, dados);
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

export const useDeletarEstoqueRolo = () => {
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
    estoqueRoloId?: string;
    tipoMovimentacao?: string;
    dataInicio?: string;
    dataFim?: string;
}) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filtros?.estoqueRoloId) params.append('estoqueRoloId', filtros.estoqueRoloId);
            if (filtros?.tipoMovimentacao) params.append('tipoMovimentacao', filtros.tipoMovimentacao);
            if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
            if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);

            const queryString = params.toString();
            const { data } = await apiClient.get<MovimentacaoEstoque[]>(
                `/movimentacoes-estoque${queryString ? `?${queryString}` : ''}`
            );
            return data;
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

export const useCriarMovimentacaoEstoque = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: {
            estoqueRoloId: string;
            tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
            pesoMovimentado: number;
        }) => {
            const { data } = await apiClient.post<MovimentacaoEstoque>(
                '/movimentacoes-estoque',
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
            toast.error(error.response?.data?.message || 'Erro ao registrar movimentação');
        },
    });
};

export const useHistoricoRolo = (estoqueRoloId: string) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', estoqueRoloId, 'historico'],
        queryFn: async () => {
            const { data } = await apiClient.get(
                `/movimentacoes-estoque/${estoqueRoloId}/historico`
            );
            return data;
        },
        enabled: !!estoqueRoloId,
    });
};
