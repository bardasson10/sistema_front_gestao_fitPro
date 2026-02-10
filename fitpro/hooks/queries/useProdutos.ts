import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/api-client';
import { toast } from 'sonner';

// ============ TIPOS ============

interface TipoProduto {
  id: string;
  nome: string;
  produtos: any[];
  tamanhos: any[];
  createdAt: string;
}

interface Tamanho {
  id: string;
  nome: string;
  ordem: number;
  createdAt: string;
}

interface Produto {
  id: string;
  tipoProdutoId: string;
  nome: string;
  sku: string;
  fabricante: string;
  custoMedioPeca: number;
  precoMedioVenda: number;
  tipo: TipoProduto;
  lotes: any[];
  createdAt: string;
}

// ============ TIPOS DE PRODUTO ============

export const useTiposProduto = () => {
  return useQuery({
    queryKey: ['tipos-produto'],
    queryFn: async () => {
      const { data } = await apiClient.get<TipoProduto[]>('/tipos-produto');
      return data;
    },
  });
};

export const useTipoProduto = (id: string) => {
  return useQuery({
    queryKey: ['tipos-produto', id],
    queryFn: async () => {
      const { data } = await apiClient.get<TipoProduto>(`/tipos-produto/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nome: string) => {
      const { data } = await apiClient.post<TipoProduto>('/tipos-produto', { nome });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao criar tipo de produto');
    },
  });
};

export const useAtualizarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { data } = await apiClient.put<TipoProduto>(`/tipos-produto/${id}`, { nome });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produto', data.id] });
      toast.success('Tipo de produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao atualizar tipo de produto');
    },
  });
};

export const useDeletarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tipos-produto/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Tipo de produto deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao deletar tipo de produto');
    },
  });
};

// ============ TAMANHOS ============

export const useTamanhos = () => {
  return useQuery({
    queryKey: ['tamanhos'],
    queryFn: async () => {
      try {
        console.log('🚀 Iniciando fetch de /tamanhos...');
        const { data } = await apiClient.get<any>('/tamanhos');
        
        console.log('📏 Resposta raw:', data);
        console.log('📏 Tipo da resposta:', typeof data);
        console.log('📏 É array?', Array.isArray(data));
        
        // Suportar diferentes formatos de resposta
        if (Array.isArray(data)) {
          console.log('✅ Formato array. Tamanhos:', data.length);
          return data;
        }
        
        if (data?.data && Array.isArray(data.data)) {
          console.log('✅ Formato com .data. Tamanhos:', data.data.length);
          return data.data;
        }
        
        if (data?.tamanhos && Array.isArray(data.tamanhos)) {
          console.log('✅ Formato com .tamanhos. Tamanhos:', data.tamanhos.length);
          return data.tamanhos;
        }
        
        console.warn('⚠️ Nenhum formato reconhecido. Retornando vazio.');
        console.warn('Estrutura:', JSON.stringify(data, null, 2));
        return [];
      } catch (error: any) {
        console.error('❌ Erro ao buscar tamanhos:', error);
        console.error('Status:', error?.response?.status);
        console.error('Dados do erro:', error?.response?.data);
        throw error;
      }
    },
  });
};

export const useTamanho = (id: string) => {
  return useQuery({
    queryKey: ['tamanhos', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Tamanho>(`/tamanhos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: { nome: string; ordem: number }) => {
      const { data } = await apiClient.post<Tamanho>('/tamanhos', dados);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      toast.success('Tamanho criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao criar tamanho');
    },
  });
};

export const useAtualizarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string; nome: string; ordem: number }) => {
      const { data } = await apiClient.put<Tamanho>(`/tamanhos/${id}`, dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      queryClient.invalidateQueries({ queryKey: ['tamanhos', data.id] });
      toast.success('Tamanho atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao atualizar tamanho');
    },
  });
};

export const useDeletarTamanho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tamanhos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      toast.success('Tamanho deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao deletar tamanho');
    },
  });
};

// ============ PRODUTOS ============

export const useProdutos = (tipoProdutoId?: string) => {
  return useQuery({
    queryKey: ['produtos', tipoProdutoId],
    queryFn: async () => {
      try {
        console.log('🚀 Iniciando fetch de /produtos...');
        const params = tipoProdutoId ? `?tipoProdutoId=${tipoProdutoId}` : '';
        const url = `/produtos${params}`;
        console.log('📍 URL:', url);
        
        const { data } = await apiClient.get<any>(url);
        
        console.log('📦 Resposta raw:', data);
        console.log('📦 Tipo da resposta:', typeof data);
        console.log('📦 É array?', Array.isArray(data));
        
        // Suportar diferentes formatos de resposta
        if (Array.isArray(data)) {
          console.log('✅ Formato array. Produtos:', data.length);
          return data;
        }
        
        if (data?.data && Array.isArray(data.data)) {
          console.log('✅ Formato com .data. Produtos:', data.data.length);
          return data.data;
        }
        
        if (data?.produtos && Array.isArray(data.produtos)) {
          console.log('✅ Formato com .produtos. Produtos:', data.produtos.length);
          return data.produtos;
        }
        
        console.warn('⚠️ Nenhum formato reconhecido. Retornando vazio.');
        console.warn('Estrutura:', JSON.stringify(data, null, 2));
        return [];
      } catch (error: any) {
        console.error('❌ Erro ao buscar produtos:', error);
        console.error('Status:', error?.response?.status);
        console.error('Dados do erro:', error?.response?.data);
        throw error;
      }
    },
  });
};

export const useProduto = (id: string) => {
  return useQuery({
    queryKey: ['produtos', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Produto>(`/produtos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCriarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: {
      tipoProdutoId: string;
      nome: string;
      sku: string;
      fabricante: string;
      custoMedioPeca: number;
      precoMedioVenda: number;
    }) => {
      const { data } = await apiClient.post<Produto>('/produtos', dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos', data.tipoProdutoId] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao criar produto');
    },
  });
};

export const useAtualizarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: any) => {
      const { data } = await apiClient.put<Produto>(`/produtos/${id}`, dados);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos', data.id] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao atualizar produto');
    },
  });
};

export const useDeletarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/produtos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao deletar produto');
    },
  });
};

// ============ ASSOCIAÇÕES TIPO PRODUTO - TAMANHO ============

export const useTamanhosPorTipo = (tipoProdutoId: string) => {
  return useQuery({
    queryKey: ['tipos-produto', tipoProdutoId, 'tamanhos'],
    queryFn: async () => {
      const { data } = await apiClient.get<Tamanho[]>(
        `/tipos-produto/${tipoProdutoId}/tamanhos`
      );
      return data;
    },
    enabled: !!tipoProdutoId,
  });
};

export const useAssociarTamanhoTipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: { tipoProdutoId: string; tamanhoId: string }) => {
      const { data } = await apiClient.post('/tipos-produto-tamanho', dados);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tipos-produto', variables.tipoProdutoId, 'tamanhos'],
      });
      toast.success('Tamanho associado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao associar tamanho');
    },
  });
};

export const useDeletarAssociacaoTamanhoTipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tipos-produto-tamanho/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produto'] });
      toast.success('Associação removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error|| 'Erro ao remover associação');
    },
  });
};
