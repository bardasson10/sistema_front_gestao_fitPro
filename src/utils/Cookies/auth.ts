const AUTH_USER_ID_COOKIE = "auth_user_id";
const AUTH_TOKEN_COOKIE = "auth_token";
const AUTH_USER_NAME_COOKIE = "auth_user_name";
const AUTH_USER_EMAIL_COOKIE = "auth_user_email";
const AUTH_USER_PERFIL_COOKIE = "auth_user_perfil";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

const isBrowser = typeof document !== "undefined";

interface UserAuthData {
  id: string;
  nome: string;
  email: string;
  perfil: "ADM" | "GERENTE" | "FUNCIONARIO";
  token: string;
}

// 1. Função base para ler no Navegador (Client-side)
const readCookieBrowser = (name: string): string | null => {
  if (!isBrowser) return null;

  const prefix = `${name}=`;
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));

  if (!found) return null;

  return decodeURIComponent(found.slice(prefix.length));
};

// 2. O CORAÇÃO DO SISTEMA: Função universal para ler o cookie (SSR e Navegador)
const getUniversalCookie = async (name: string): Promise<string | null> => {
  // Se for o Servidor (SSR / F5 do Next.js)
  if (!isBrowser) {
    try {
      const { cookies } = await import("next/headers");

      // No Next.js 15+, cookies() retorna uma Promise, então já damos o await direto aqui:
      const cookieStore = await cookies();
      const cookie = cookieStore.get(name);

      return cookie?.value || null;
    } catch (error) {
      console.warn(`[Aviso SSR] Não foi possível ler o cookie ${name} no servidor.`);
      return null;
    }
  }


  return readCookieBrowser(name);
};

const writeCookie = (name: string, value: string) => {
  if (!isBrowser) return;

  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax${secure}`;
};

const deleteCookie = (name: string) => {
  if (!isBrowser) return;

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

// --- Exportações Públicas ---

export const saveAuthCookies = async (userData: UserAuthData) => {
  writeCookie(AUTH_USER_ID_COOKIE, userData.id);
  writeCookie(AUTH_TOKEN_COOKIE, userData.token);
  writeCookie(AUTH_USER_NAME_COOKIE, userData.nome);
  writeCookie(AUTH_USER_EMAIL_COOKIE, userData.email);
  writeCookie(AUTH_USER_PERFIL_COOKIE, userData.perfil);
};

export const getAuthUserId = async (): Promise<string | null> => {
  return getUniversalCookie(AUTH_USER_ID_COOKIE); // Agora chama a função universal
};

export const getAuthToken = async (): Promise<string | null> => {
  return getUniversalCookie(AUTH_TOKEN_COOKIE); // Agora chama a função universal
};

export const getAuthUserData = async (): Promise<UserAuthData | null> => {
  // Aguarda todos os cookies através da função universal
  const userId = await getUniversalCookie(AUTH_USER_ID_COOKIE);
  const token = await getUniversalCookie(AUTH_TOKEN_COOKIE);
  const nome = await getUniversalCookie(AUTH_USER_NAME_COOKIE);
  const email = await getUniversalCookie(AUTH_USER_EMAIL_COOKIE);
  const perfil = await getUniversalCookie(AUTH_USER_PERFIL_COOKIE);

  if (!userId || !token || !nome || !email || !perfil) {
    return null;
  }

  return {
    id: userId,
    token,
    nome,
    email,
    perfil: perfil as "ADM" | "GERENTE" | "FUNCIONARIO",
  };
};

export const removeAuthCookies = async () => {
  deleteCookie(AUTH_USER_ID_COOKIE);
  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_USER_NAME_COOKIE);
  deleteCookie(AUTH_USER_EMAIL_COOKIE);
  deleteCookie(AUTH_USER_PERFIL_COOKIE);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getAuthUserId();
  const token = await getAuthToken();
  return !!(userId && token);
};