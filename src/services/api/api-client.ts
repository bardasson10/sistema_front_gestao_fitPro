import axios, { AxiosInstance } from 'axios';
import { getAuthToken, removeAuthCookies } from '@/utils/Cookies/auth';
import { toast } from 'sonner';

let isRedirectingToLogin = false;

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
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expirado ou inválido
                    await removeAuthCookies();

                    if (!isRedirectingToLogin) {
                        isRedirectingToLogin = true;
                        toast.error(error.response?.data?.error || 'Sessao expirada. Faca login novamente.');

                        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                            window.location.assign('/login');
                        }
                    }
                }
                console.error(`❌ [${error.response?.status}] ${error.config?.url} - Erro:`, error.response?.data);
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
