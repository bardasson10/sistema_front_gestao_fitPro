import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { IMovimentacaoEstoque } from '@/types/Movimentacao';
import { PaginatedResponse } from '@/types/production';
import { IFiltroEstoqueRolo } from '@/types/EstoqueRolo';


export const useGetListAllMovimentacoesEstoque = (filtros?: IFiltroEstoqueRolo, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', filtros],
        queryFn: async () => {
            const { data } = await apiClient.get<{data: IMovimentacaoEstoque[], pagination: PaginatedResponse}>(
                `/movimentacoes-estoque`,
                {
                    params: filtros
                }
            );
            return data.data
        },
        enabled: options?.enabled ?? true,
    });
};

export const useGetByIdMovimentacaoEstoque = (id: string) => {
    return useQuery({
        queryKey: ['movimentacoes-estoque', id],
        queryFn: async () => {
            const { data } = await apiClient.get<IMovimentacaoEstoque>(
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

export const usePostCreateMovimentacaoEstoque = ({ usuarioId }: MovimentacaoHistoricoParams) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['movimentacao-estoque', 'criar'],
        mutationFn: async (dados: {
            EstoqueTecidoId: string;
            tipoMovimentacao: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
            pesoMovimentado: number;
        }) => {
            const { data } = await apiClient.post<IMovimentacaoEstoque>(
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

export const useGetHistoricoRolo = (EstoqueTecidoId: string) => {
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
