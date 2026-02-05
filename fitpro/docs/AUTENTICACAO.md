# Sistema de Autenticação - FitPro

## Visão Geral

Sistema completo de autenticação implementado com Next.js 16, incluindo:
- Login com validação de credenciais
- Armazenamento seguro de dados do usuário em cookies HTTP-only
- Middleware para proteção de rotas
- Logout com limpeza de cookies
- Hook personalizado para acessar dados do usuário

## Arquivos Criados/Modificados

### 1. Utilitário de Cookies de Autenticação
**Arquivo:** `utils/Cookies/auth.ts`

Funções disponíveis:
- `saveAuthCookies(userData)` - Salva dados do usuário nos cookies
- `getAuthUserId()` - Retorna o ID do usuário autenticado
- `getAuthToken()` - Retorna o token de autenticação
- `getAuthUserData()` - Retorna todos os dados do usuário
- `removeAuthCookies()` - Remove todos os cookies de autenticação
- `isAuthenticated()` - Verifica se o usuário está autenticado

### 2. Middleware de Proteção de Rotas
**Arquivo:** `middleware.ts`

O middleware intercepta todas as requisições e:
- Redireciona usuários **autenticados** que tentam acessar `/login` ou `/register` para `/` (dashboard)
- Redireciona usuários **não autenticados** que tentam acessar rotas privadas para `/login`

### 3. Página de Login Atualizada
**Arquivo:** `app/(public)/login/page.tsx`

Implementações:
- Validação de formulário com React Hook Form + Zod
- Chamada ao serviço de autenticação
- Salvamento de dados nos cookies após login bem-sucedido
- Redirecionamento para dashboard
- Feedback visual com toasts (sucesso/erro)
- Loading state no botão

### 4. Botão de Logout Atualizado
**Arquivo:** `components/LoginForms/logout-button.tsx`

Implementações:
- Limpeza de todos os cookies de autenticação
- Redirecionamento para página de login
- Feedback com toast

### 5. Hook de Autenticação
**Arquivo:** `hooks/use-auth.ts`

Hook customizado para acessar dados do usuário em componentes client-side:
```tsx
const { userData, isLoading } = useAuth();
```

### 6. API Route para Dados do Usuário
**Arquivo:** `app/api/auth/me/route.ts`

Endpoint GET que retorna dados do usuário autenticado baseado nos cookies.

## Como Usar

### Login
```tsx
// A página de login já está implementada
// Acesse: /login
// Insira email e senha válidos
// Após autenticação bem-sucedida, será redirecionado para /
```

### Acessar Dados do Usuário em Componentes Client

```tsx
'use client';
import { useAuth } from '@/hooks/use-auth';

export function MinhaComponente() {
  const { userData, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!userData) {
    return null;
  }

  return (
    <div>
      <p>Bem-vindo, {userData.nome}!</p>
      <p>Email: {userData.email}</p>
      <p>Perfil: {userData.perfil}</p>
    </div>
  );
}
```

### Acessar Dados do Usuário em Server Components

```tsx
import { getAuthUserData } from '@/utils/Cookies/auth';

export default async function MinhaPage() {
  const userData = await getAuthUserData();

  if (!userData) {
    // Usuário não autenticado (não deveria acontecer se middleware estiver configurado)
    return null;
  }

  return (
    <div>
      <h1>Olá, {userData.nome}!</h1>
      <p>Seu perfil: {userData.perfil}</p>
    </div>
  );
}
```

### Logout
```tsx
// O botão de logout já está implementado
// Use o componente <LogOutButton /> onde necessário
import { LogOutButton } from '@/components/LoginForms/logout-button';
```

### Verificar Autenticação em Server Actions

```tsx
'use server';
import { isAuthenticated, getAuthUserId } from '@/utils/Cookies/auth';

export async function minhaServerAction() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    throw new Error('Não autenticado');
  }

  const userId = await getAuthUserId();
  // Fazer algo com userId...
}
```

## Cookies Armazenados

Os seguintes cookies HTTP-only são criados após login:
- `auth_user_id` - ID do usuário
- `auth_token` - Token de autenticação
- `auth_user_name` - Nome do usuário
- `auth_user_email` - Email do usuário
- `auth_user_perfil` - Perfil do usuário (ADM, GERENTE, FUNCIONARIO)

**Configurações de segurança:**
- `httpOnly: true` - Não acessível via JavaScript (proteção contra XSS)
- `secure: true` (em produção) - Apenas transmitido via HTTPS
- `sameSite: 'lax'` - Proteção contra CSRF
- `maxAge: 7 dias` - Expiração automática

## Fluxo de Autenticação

1. **Usuário acessa /login**
2. **Preenche credenciais e submete formulário**
3. **Chamada ao AutenticacaoService (API backend)**
4. **Se sucesso:** 
   - Dados do usuário são salvos nos cookies
   - Toast de sucesso é exibido
   - Redirecionamento para /
5. **Se erro:**
   - Toast de erro é exibido
   - Usuário permanece na página de login

## Proteção de Rotas

### Rotas Públicas
- `/login`
- `/register`

### Rotas Privadas (requerem autenticação)
- `/` (dashboard)
- `/colaboradores`
- `/fornecedores`
- `/faccoes`
- `/tecidos`
- `/estoque`
- `/lotes`
- `/producao`
- `/conferencia`

O middleware automaticamente redireciona baseado no status de autenticação.

## Próximos Passos (Opcional)

- Implementar refresh token para renovação automática
- Adicionar rate limiting para tentativas de login
- Implementar recuperação de senha
- Adicionar autenticação de dois fatores (2FA)
- Criar logs de auditoria de login/logout
