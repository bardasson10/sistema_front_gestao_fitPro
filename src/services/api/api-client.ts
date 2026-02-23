import axios, { AxiosInstance } from 'axios';
import { getAuthToken } from '@/utils/Cookies/auth';
import { toast } from 'sonner';

class APIClient {
    private client: AxiosInstance;

    constructor() {
        const baseURL =
            process.env.NEXT_PUBLIC_API_BASE_URL;

        this.client = axios.create({
            baseURL,
        });

        // Interceptor para adicionar token em todas as requisições
        this.client.interceptors.request.use(async (config) => {
            const token = await getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
            return config;
        });

        // Interceptor para tratamento de erros
        this.client.interceptors.response.use(
            (response) => {
                console.log(`📥 [${response.status}] ${response.config.url} - Dados:`, response.data);
                return response;
            },
            (error) => {
                console.error(`❌ [${error.response?.status}] ${error.config?.url} - Erro:`, error.response?.data);
                if (error.response?.status === 401) {
                    // Token expirado ou inválido
                    toast.error(error.response.data?.error);
                }
                return Promise.reject(error);
            }
        );
    }

    get<T>(url: string, config = {}) {
        return this.client.get<T>(url, config);
    }

    post<T>(url: string, data?: any, config = {}) {
        return this.client.post<T>(url, data, config);
    }

    put<T>(url: string, data?: any, config = {}) {
        return this.client.put<T>(url, data, config);
    }

    delete<T>(url: string, config = {}) {
        return this.client.delete<T>(url, config);
    }
}

export const apiClient = new APIClient();
