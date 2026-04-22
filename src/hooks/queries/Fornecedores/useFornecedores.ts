import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { PaginatedResponse } from '@/types/production';



type TFornecedor = 'tecido' | 'aviamento';

interface Tecido {
    id: string;
    corId: string;
    nome: string;
    codigoReferencia: string;
    fornecedorId?: string;
}

export interface IFornecedor {
    id?: string;
    nome: string;
    tipo: TFornecedor;
    contato: string;
    createdAt?: string;
    updatedAt?: string;
    tecidos: Tecido[];
}


export const useGetListAllFornecedores = () => {
    return useSuspenseQuery({
        queryKey: ['fornecedores'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: IFornecedor[], pagination: PaginatedResponse }>('/fornecedores');
            return response.data.data;
        },
    });
};

export const useGetByIdFornecedor = (id: string) => {
    return useSuspenseQuery({
        queryKey: ['fornecedores', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: IFornecedor[], pagination: PaginatedResponse }>(`/fornecedores/${id}`);
            return response.data.data;
        },
    });
};

export const useCreateFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dados: { nome: string; tipo: string; contato: string }) => {
            const response = await apiClient.post<{ data: IFornecedor }>('/fornecedores', dados);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error|| 'Erro ao criar fornecedor');
        },
    });
};

export const usePutFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...dados }: any) => {
            const response = await apiClient.put<{ data: IFornecedor }>(`/fornecedores/${id}`, dados);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            queryClient.invalidateQueries({ queryKey: ['fornecedores', data.id] });
            toast.success('Fornecedor atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error);
        },
    });
};

export const useDeleteFornecedor = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/fornecedores/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
            toast.success('Fornecedor deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error);
        },
    });
};
