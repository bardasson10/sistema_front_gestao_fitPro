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

const readCookie = (name: string): string | null => {
  if (!isBrowser) return null;

  const prefix = `${name}=`;
  const found = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));

  if (!found) return null;

  return decodeURIComponent(found.slice(prefix.length));
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

export const saveAuthCookies = async (userData: UserAuthData) => {
  writeCookie(AUTH_USER_ID_COOKIE, userData.id);
  writeCookie(AUTH_TOKEN_COOKIE, userData.token);
  writeCookie(AUTH_USER_NAME_COOKIE, userData.nome);
  writeCookie(AUTH_USER_EMAIL_COOKIE, userData.email);
  writeCookie(AUTH_USER_PERFIL_COOKIE, userData.perfil);
};

export const getAuthUserId = async (): Promise<string | null> => {
  return readCookie(AUTH_USER_ID_COOKIE);
};

export const getAuthToken = async (): Promise<string | null> => {
  return readCookie(AUTH_TOKEN_COOKIE);
};

export const getAuthUserData = async (): Promise<UserAuthData | null> => {
  const userId = readCookie(AUTH_USER_ID_COOKIE);
  const token = readCookie(AUTH_TOKEN_COOKIE);
  const nome = readCookie(AUTH_USER_NAME_COOKIE);
  const email = readCookie(AUTH_USER_EMAIL_COOKIE);
  const perfil = readCookie(AUTH_USER_PERFIL_COOKIE);

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
