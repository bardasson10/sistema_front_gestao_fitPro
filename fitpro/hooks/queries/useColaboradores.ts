import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';
import { Colaborador } from '@/types/production';

// ============ TIPOS ============

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface UseColaboradoresParams {
    page?: number;
    limit?: number;
    userPerfil?: 'ADM' | 'GERENTE' | 'FUNCIONARIO';
    excludeUserId?: string;
}

// ============ COLABORADORES ============

export const useColaboradores = (params?: UseColaboradoresParams) => {
    return useQuery({
        queryKey: ['colaboradores', params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.userPerfil) queryParams.append('userPerfil', params.userPerfil);
            if (params?.excludeUserId) queryParams.append('excludeUserId', params.excludeUserId);

            const url = `/users/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const { data } = await apiClient.get<PaginatedResponse<Colaborador>>(url);
        
            return data;
        },
    });
};

export const useColaborador = (id: string) => {
    return useQuery({
        queryKey: ['colaboradores', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Colaborador>(`/users/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useCriarColaborador = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'createdAt' | 'updatedAt'>) => {
            const { data } = await apiClient.post<Colaborador>('/users', colaborador);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            toast.success('Colaborador criado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao criar colaborador');
        },
    });
};

export const useAtualizarColaborador = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...colaborador }: Partial<Colaborador> & { id: string }) => {
            const { data } = await apiClient.put<Colaborador>(`/user/${id}`, colaborador);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            queryClient.invalidateQueries({ queryKey: ['colaboradores', data.id] });
            toast.success('Colaborador atualizado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Erro ao atualizar colaborador');
        },
    });
};

export const useDeletarColaborador = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            toast.success('Colaborador deletado com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Erro ao deletar colaborador');
        },
    });
};
