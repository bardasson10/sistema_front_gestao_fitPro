'use client';
import { getAuthUserData } from '@/utils/Cookies/auth';
import { useEffect, useState } from 'react';

interface UserData {
    id: string;
    nome: string;
    email: string;
    perfil: "ADM" | "GERENTE" | "FUNCIONARIO";
}

let cachedUserData: UserData | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useAuth() {
    const [user, setUser] = useState({id: "", nome: "", email: "", perfil: "", urlAvatar: "" })

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await getAuthUserData();
            setUser({
                id: userData?.id || "",
                nome: userData?.nome || "",
                email: userData?.email || "",
                perfil: userData?.perfil || "",
                urlAvatar: "",
            })
        }
        fetchUserData()
    }, [])

    return { user };
}
