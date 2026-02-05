'use server';
import { cookies } from "next/headers";

const AUTH_USER_ID_COOKIE = "auth_user_id";
const AUTH_TOKEN_COOKIE = "auth_token";
const AUTH_USER_NAME_COOKIE = "auth_user_name";
const AUTH_USER_EMAIL_COOKIE = "auth_user_email";
const AUTH_USER_PERFIL_COOKIE = "auth_user_perfil";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

interface UserAuthData {
  id: string;
  nome: string;
  email: string;
  perfil: "ADM" | "GERENTE" | "FUNCIONARIO";
  token: string;
}

export const saveAuthCookies = async (userData: UserAuthData) => {
  const cookieStore = await cookies();
  
  cookieStore.set(AUTH_USER_ID_COOKIE, userData.id, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set(AUTH_TOKEN_COOKIE, userData.token, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set(AUTH_USER_NAME_COOKIE, userData.nome, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set(AUTH_USER_EMAIL_COOKIE, userData.email, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set(AUTH_USER_PERFIL_COOKIE, userData.perfil, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export const getAuthUserId = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_USER_ID_COOKIE);
  return userId?.value || null;
};

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE);
  return token?.value || null;
};

export const getAuthUserData = async (): Promise<UserAuthData | null> => {
  const cookieStore = await cookies();
  
  const userId = cookieStore.get(AUTH_USER_ID_COOKIE);
  const token = cookieStore.get(AUTH_TOKEN_COOKIE);
  const nome = cookieStore.get(AUTH_USER_NAME_COOKIE);
  const email = cookieStore.get(AUTH_USER_EMAIL_COOKIE);
  const perfil = cookieStore.get(AUTH_USER_PERFIL_COOKIE);

  if (!userId || !token || !nome || !email || !perfil) {
    return null;
  }

  return {
    id: userId.value,
    token: token.value,
    nome: nome.value,
    email: email.value,
    perfil: perfil.value as "ADM" | "GERENTE" | "FUNCIONARIO",
  };
};

export const removeAuthCookies = async () => {
  const cookieStore = await cookies();
  
  cookieStore.delete(AUTH_USER_ID_COOKIE);
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(AUTH_USER_NAME_COOKIE);
  cookieStore.delete(AUTH_USER_EMAIL_COOKIE);
  cookieStore.delete(AUTH_USER_PERFIL_COOKIE);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getAuthUserId();
  const token = await getAuthToken();
  return !!(userId && token);
};
