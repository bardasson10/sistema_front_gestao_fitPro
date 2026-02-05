import { NextResponse } from 'next/server';
import { getAuthUserData } from '@/utils/Cookies/auth';

export async function GET() {
  try {
    const userData = await getAuthUserData();

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      perfil: userData.perfil,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
