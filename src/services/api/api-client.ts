import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, removeAuthCookies } from '@/utils/Cookies/auth';
import { toast } from 'sonner';

// Flags globais para controle de concorrência
let isRedirectingToLogin = false;

// Variáveis preparadas para o futuro Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Interceptor de Requisição
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await getAuthToken();
                
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
                }
                
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor de Resposta
        this.client.interceptors.response.use(
            (response) => {
                if (process.env.NODE_ENV === 'development') {
                    // Simplificado para não poluir tanto o terminal
                    console.log(`📥 [${response.status}] ${response.config.url} - Sucesso`);
                }
                return response;
            },
            async (error: AxiosError<any>) => {
    const isServer = typeof window === 'undefined';
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest) {
        
        // 1. SE ESTIVER NO SERVIDOR (SSR)
        if (isServer) {
            console.warn(`⚠️ [SSR - 401] Ignorando falha no servidor para a rota: ${originalRequest.url}`);
            
            // Resolve a promessa com dados vazios para não quebrar (Erro 500) o Next.js.
            // Quando a página carregar no navegador, o React Query vai refazer a requisição (hydration) com o token real.
            return Promise.resolve({ data: { data: [], pagination: {} } }); 
        }

                    // 2. FUTURA LÓGICA DE REFRESH TOKEN (Para quando o token durar menos tempo)
                    /*
                    if (!originalRequest._retry) {
                        if (isRefreshing) {
                            // Se já estiver atualizando, coloca a requisição na fila
                            return new Promise(function (resolve, reject) {
                                failedQueue.push({ resolve, reject });
                            }).then((token) => {
                                originalRequest.headers.Authorization = 'Bearer ' + token;
                                return this.client(originalRequest);
                            }).catch((err) => Promise.reject(err));
                        }

                        originalRequest._retry = true;
                        isRefreshing = true;

                        try {
                            // const newToken = await suaFuncaoDeRefreshTokenAqui();
                            // processQueue(null, newToken);
                            // originalRequest.headers.Authorization = 'Bearer ' + newToken;
                            // return this.client(originalRequest);
                        } catch (refreshError) {
                            // processQueue(refreshError, null);
                            // Cai no logout abaixo
                        } finally {
                            isRefreshing = false;
                        }
                    }
                    */

                    // 3. SE ESTIVER NO CLIENTE (Navegador) - Fallback de Logout
                    await removeAuthCookies();

                    if (!isRedirectingToLogin) {
                        isRedirectingToLogin = true;
                        toast.error(error.response?.data?.error || 'Sessão expirada. Faça login novamente.');

                        // Aguarda 1 segundo para o usuário conseguir ler o Toast antes do redirecionamento
                        setTimeout(() => {
                            window.location.assign('/login');
                        }, 1000);
                    }
                }

                if (process.env.NODE_ENV === 'development' && !isServer) {
                    console.error(`❌ [${error.response?.status}] ${originalRequest?.url} - Erro:`, error.response?.data);
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