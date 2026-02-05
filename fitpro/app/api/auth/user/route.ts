import { NextResponse } from 'next/server';
import { getAuthUserData } from '@/utils/Cookies/auth';

export async function GET() {
    try {
        const userData = await getAuthUserData();

        if (!userData) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        return NextResponse.json({
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            perfil: userData.perfil,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
