# Quick Reference - Sistema de Autenticação

## 🔑 Imports Essenciais

```tsx
// Client Components
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

// Server Components/Actions
import { getAuthUserData, getAuthUserId, getAuthToken, isAuthenticated } from '@/utils/Cookies/auth';

// Logout
import { removeAuthCookies } from '@/utils/Cookies/auth';
```

## 📦 Dados do Usuário

```typescript
interface UserData {
  id: string;                                    // UUID
  nome: string;                                  // Nome completo
  email: string;                                 // Email
  perfil: "ADM" | "GERENTE" | "FUNCIONARIO";    // Tipo de usuário
  token: string;                                 // JWT (apenas no login)
}
```

## 🎯 Use Cases Rápidos

### 1. Verificar se está autenticado (Server)
```tsx
const isAuth = await isAuthenticated();
if (!isAuth) {
  redirect('/login');
}
```

### 2. Pegar ID do usuário (Server)
```tsx
const userId = await getAuthUserId();
// userId: string | null
```

### 3. Pegar todos dados (Server)
```tsx
const userData = await getAuthUserData();
// userData: UserData | null
```

### 4. Usar em Client Component
```tsx
const { userData, isLoading } = useAuth();

if (isLoading) return <Skeleton />;
if (!userData) return null;

return <p>{userData.nome}</p>;
```

### 5. Fazer Logout
```tsx
import { removeAuthCookies } from '@/utils/Cookies/auth';
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleLogout = async () => {
  await removeAuthCookies();
  router.push('/login');
  router.refresh();
};
```

## 🛡️ Middleware (Automático)

O middleware já está configurado e protege automaticamente:
- ✅ Rotas privadas → Requer autenticação
- ✅ /login e /register → Redireciona se já autenticado
- ✅ Todas as outras rotas → Protegidas por padrão

## 🍪 Acessar Cookies Manualmente (DevTools)

```
Application → Cookies → http://localhost:3000
```

Cookies disponíveis:
- auth_user_id
- auth_token
- auth_user_name
- auth_user_email
- auth_user_perfil

## 🎨 Componentes Prontos

```tsx
// Header com avatar do usuário
import { Header } from '@/components/Header';

// Avatar/Dropdown do usuário
import { UserNav } from '@/components/Header/components/UserNav';

// Botão de logout
import { LogOutButton } from '@/components/LoginForms/logout-button';
```

## 🔄 Fluxo Visual

```
Login → saveAuthCookies() → Middleware valida → Acesso liberado
                              ↓
                         Cookies HTTP-only
                              ↓
                    getAuthUserData() / useAuth()
```

## ⚡ Dicas Rápidas

1. **Sempre use async/await** com funções de cookies
2. **Client components** → use `useAuth()` hook
3. **Server components** → use `getAuthUserData()`
4. **Server actions** → use `isAuthenticated()` ou `getAuthUserId()`
5. **Não tente** acessar cookies via `document.cookie` (são HTTP-only)
6. **Middleware** protege automaticamente, não precisa verificar manualmente

## 🚨 Erros Comuns

| Erro | Solução |
|------|---------|
| NextRouter not mounted | Use `useRouter` from `next/navigation` |
| Cookies undefined | Aguarde `isLoading === false` antes de usar |
| Redirecionamento loop | Verifique configuração do middleware |
| Token expirado | Implemente refresh token (futuro) |

## 📞 API Endpoints

```
GET /api/auth/me → Retorna dados do usuário autenticado
```

Exemplo de uso:
```tsx
const response = await fetch('/api/auth/me');
const userData = await response.json();
```
