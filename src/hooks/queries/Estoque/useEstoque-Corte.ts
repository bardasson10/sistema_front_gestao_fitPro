import { useMutation, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';
import { EstoqueCorte } from '@/types/EstoqueCorte';


type EstoqueCorteResponse = {
    data: EstoqueCorte[];
    pagination: PaginatedResponse;
};



export type EstoqueCorteFiltros = {
    produtoId?: string;
    loteProducaoId?: string;
    excludeTipoProdutoNome?: string;
    tamanhoId?: string;
    corId?: string;
    limit?: number;
    page?: number;
}

const buildEstoqueCorteQueryString = (filtros?: EstoqueCorteFiltros) => {
    const params = new URLSearchParams();

    if (filtros?.produtoId) params.append('produtoId', filtros.produtoId);
    if (filtros?.loteProducaoId) params.append('loteProducaoId', filtros.loteProducaoId);
    if (filtros?.tamanhoId) params.append('tamanhoId', filtros.tamanhoId);
    if (filtros?.corId) params.append('corId', filtros.corId);
    if (filtros?.limit) params.append('limit', String(filtros.limit));
    if (filtros?.page) params.append('page', String(filtros.page));

    if (!filtros?.limit) params.append('limit', '10000');

    return params.toString();
};

const fetchEstoqueCorte = async (filtros?: EstoqueCorteFiltros): Promise<EstoqueCorteResponse> => {
    const queryString = buildEstoqueCorteQueryString(filtros);
    const { data } = await apiClient.get<EstoqueCorteResponse>(
        `/estoque-corte${queryString ? `?${queryString}` : ''}`
    );

    return data;
};


export const useGetEstoqueCorte = (filtros?: EstoqueCorteFiltros) => {
    return useSuspenseQuery({
        queryKey: ['estoqueCorte', filtros],
        queryFn: async () => {
            try {
                const data = await fetchEstoqueCorte(filtros);
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

export const useGetEstoqueCortePaginado = (filtros?: EstoqueCorteFiltros) => {
    return useSuspenseQuery({
        queryKey: ['estoqueCorte', 'paginado', filtros],
        queryFn: async () => {
            try {
                return await fetchEstoqueCorte(filtros);
            } catch (error: any) {
                const mensagem = error.response?.data?.details?.[0]?.mensage ||
                    error.response?.data?.error;
                toast.error(mensagem);
                return {
                    data: [],
                    pagination: {
                        page: filtros?.page ?? 1,
                        limit: filtros?.limit ?? 0,
                        total: 0,
                        pages: 1,
                    },
                };
            }
        }
    });
};