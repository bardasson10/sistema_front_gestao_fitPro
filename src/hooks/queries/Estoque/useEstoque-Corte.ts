import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { EstoqueCorte } from '@/types/EstoqueCorte';



export type EstoqueCorteFiltros = {
    produtoId?: string;
    loteProducaoId?: string;
    tamanhoId?: string;
    corId?: string;
    limit?: number;
    page?: number;
}


export const useGetEstoqueCorte = (filtros?: EstoqueCorteFiltros) => {
    return useSuspenseQuery({
        queryKey: ['estoqueCorte', filtros],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filtros?.produtoId) params.append('produtoId', filtros.produtoId);
            if (filtros?.loteProducaoId) params.append('loteProducaoId', filtros.loteProducaoId);
            if (filtros?.tamanhoId) params.append('tamanhoId', filtros.tamanhoId);
            if (filtros?.corId) params.append('corId', filtros.corId);
            if (filtros?.limit) params.append('limit', String(filtros.limit));
            if (filtros?.page) params.append('page', String(filtros.page));

            if (!filtros?.limit) params.append('limit', '1000');

            const queryString = params.toString();

            try {
                const { data } = await apiClient
                    .get<{ data: EstoqueCorte[]; pagination: PaginatedResponse }>(
                        `/estoque-corte${queryString ? `?${queryString}` : ''}`
                    );
                return data.data;
            } catch (error: any) {
                const mensagem = error.response?.data?.details?.[0]?.mensage ||
                    error.response?.data?.error
                toast.error(mensagem);
                return [];
            }
        }
    })
};