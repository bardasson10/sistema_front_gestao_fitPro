'use client';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  nome: string;
  email: string;
  perfil: "ADM" | "GERENTE" | "FUNCIONARIO";
}

export function useAuth() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, isLoading };
}
