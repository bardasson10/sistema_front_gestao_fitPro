'use server';
import { cookies } from "next/headers";

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export const saveSidebarState = async (sidebarState: boolean) => {
  const cookieStore = await cookies();
  cookieStore.set(SIDEBAR_COOKIE_NAME, JSON.stringify(sidebarState), {
    maxAge: SIDEBAR_COOKIE_MAX_AGE,
  });
};

export const getSidebarState = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get(SIDEBAR_COOKIE_NAME);
  return sidebarState ? JSON.parse(sidebarState.value) : false;
};

export const removeSidebarState = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SIDEBAR_COOKIE_NAME);
};