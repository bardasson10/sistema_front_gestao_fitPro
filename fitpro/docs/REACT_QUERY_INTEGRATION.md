# Integração React Query - Documentação Completa

## 📁 Estrutura de Arquivos Criada

```
hooks/queries/
├── useProdutos.ts       # Tipos de Produto, Tamanhos, Produtos
├── useMateriais.ts      # Fornecedores, Cores, Tecidos
├── useEstoque.ts        # Estoque Rolos, Movimentações
└── useProducao.ts       # Facções, Lotes, Direcionamentos, Conferências

services/api/
└── api-client.ts        # Cliente HTTP com Axios + interceptores
```

---

## 🔧 Configuração Necessária

### 1. Variável de Ambiente
Crie ou atualize seu arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 2. Verificar instalação do React Query
```bash
npm list @tanstack/react-query
```

Se não estiver instalado:
```bash
npm install @tanstack/react-query
```

---

## 🚀 Como Usar

### Exemplo 1: Listar Tipos de Produtos

```tsx
'use client';
import { useTiposProduto } from '@/hooks/queries/useProdutos';
import { Skeleton } from '@/components/ui/skeleton';

export function ListaTiposProduto() {
  const { data: tiposProduto, isLoading, error } = useTiposProduto();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Erro ao carregar tipos de produto</div>;
  }

  return (
    <ul>
      {tiposProduto?.map((tipo) => (
        <li key={tipo.id}>{tipo.nome}</li>
      ))}
    </ul>
  );
}
```

### Exemplo 2: Criar Tipo de Produto

```tsx
'use client';
import { useCriarTipoProduto } from '@/hooks/queries/useProdutos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function CriarTipoProduto() {
  const [nome, setNome] = useState('');
  const { mutate: criar, isPending } = useCriarTipoProduto();

  const handleSubmit = () => {
    criar(nome);
    setNome('');
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Nome do tipo de produto"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <Button
        onClick={handleSubmit}
        disabled={isPending || !nome}
      >
        {isPending ? 'Criando...' : 'Criar'}
      </Button>
    </div>
  );
}
```

### Exemplo 3: Filtrar Tecidos por Fornecedor

```tsx
'use client';
import { useTecidos } from '@/hooks/queries/useMateriais';
import { useFornecedores } from '@/hooks/queries/useMateriais';
import { useState } from 'react';

export function ListaTecidosPorFornecedor() {
  const [fornecedorId, setFornecedorId] = useState('');
  
  const { data: fornecedores } = useFornecedores();
  const { data: tecidos, isLoading } = useTecidos({ fornecedorId });

  return (
    <div className="space-y-4">
      <select
        value={fornecedorId}
        onChange={(e) => setFornecedorId(e.target.value)}
      >
        <option value="">Selecione um fornecedor</option>
        {fornecedores?.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {tecidos?.map((tecido) => (
            <li key={tecido.id}>{tecido.nome}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Exemplo 4: Registrar Movimentação de Estoque

```tsx
'use client';
import { useCriarMovimentacaoEstoque, useEstoqueRolos } from '@/hooks/queries/useEstoque';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function RegistrarMovimentacao() {
  const [estoqueRoloId, setEstoqueRoloId] = useState('');
  const [peso, setPeso] = useState('');
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'ajuste' | 'devolucao'>('saida');

  const { data: rolos } = useEstoqueRolos({ situacao: 'disponivel' });
  const { mutate: registrar, isPending } = useCriarMovimentacaoEstoque();

  const handleSubmit = () => {
    registrar({
      estoqueRoloId,
      tipoMovimentacao: tipo,
      pesoMovimentado: parseFloat(peso),
    });
    setEstoqueRoloId('');
    setPeso('');
  };

  return (
    <div className="space-y-4">
      <select
        value={estoqueRoloId}
        onChange={(e) => setEstoqueRoloId(e.target.value)}
      >
        <option value="">Selecione um rolo</option>
        {rolos?.map((rolo) => (
          <option key={rolo.id} value={rolo.id}>
            {rolo.codigoBarraRolo} - {rolo.pesoAtualKg}kg
          </option>
        ))}
      </select>

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as any)}
      >
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
        <option value="ajuste">Ajuste</option>
        <option value="devolucao">Devolução</option>
      </select>

      <Input
        type="number"
        placeholder="Peso (kg)"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        step="0.01"
      />

      <Button
        onClick={handleSubmit}
        disabled={isPending || !estoqueRoloId || !peso}
      >
        {isPending ? 'Registrando...' : 'Registrar Movimentação'}
      </Button>
    </div>
  );
}
```

### Exemplo 5: Criar Lote de Produção

```tsx
'use client';
import { useCriarLoteProducao, useLotesProducao } from '@/hooks/queries/useProducao';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function CriarNovoLote() {
  const [codigoLote, setCodigoLote] = useState('LOTE-2026-001');
  const [items, setItems] = useState([
    { produtoId: '', tamanhoId: '', quantidadePlanejada: 50 },
  ]);

  const { mutate: criar, isPending } = useCriarLoteProducao();
  const { refetch } = useLotesProducao();

  const handleSubmit = async () => {
    criar({
      codigoLote,
      tecidoId: 'uuid-do-tecido',
      responsavelId: 'uuid-do-usuario',
      status: 'planejado',
      items,
    });
  };

  return (
    <div className="space-y-4">
      <input
        value={codigoLote}
        onChange={(e) => setCodigoLote(e.target.value)}
        placeholder="Código do lote"
        className="border p-2 rounded w-full"
      />

      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">Items</h3>
        {items.map((item, i) => (
          <div key={i} className="space-y-2 mb-4">
            <input
              placeholder="Produto ID"
              value={item.produtoId}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].produtoId = e.target.value;
                setItems(newItems);
              }}
            />
            <input
              placeholder="Tamanho ID"
              value={item.tamanhoId}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].tamanhoId = e.target.value;
                setItems(newItems);
              }}
            />
            <input
              type="number"
              placeholder="Quantidade"
              value={item.quantidadePlanejada}
              onChange={(e) => {
                const newItems = [...items];
                newItems[i].quantidadePlanejada = parseInt(e.target.value);
                setItems(newItems);
              }}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Lote'}
      </Button>
    </div>
  );
}
```

### Exemplo 6: Visualizar Relatório de Estoque

```tsx
'use client';
import { useRelatorioEstoque } from '@/hooks/queries/useEstoque';

export function RelatorioEstoque() {
  const { data: relatorio, isLoading } = useRelatorioEstoque();

  if (isLoading) return <p>Carregando relatório...</p>;
  if (!relatorio) return null;

  return (
    <div className="border p-4 rounded space-y-4">
      <h2 className="text-xl font-bold">Relatório de Estoque</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total de Rolos</p>
          <p className="text-2xl font-bold">{relatorio.totalRolos}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Peso Total (kg)</p>
          <p className="text-2xl font-bold">{relatorio.pesoTotal}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Rolos Disponíveis</p>
          <p className="text-2xl font-bold">{relatorio.rolosDisponíveis}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Rolos Reservados</p>
          <p className="text-2xl font-bold">{relatorio.rolosReservados}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600">Tecido com Maior Estoque</p>
        <p className="font-semibold">{relatorio.tecidoComMaiorEstoque}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">Movimentações do Mês</p>
        <p className="font-semibold">{relatorio.movimentacoesMes}</p>
      </div>
    </div>
  );
}
```

### Exemplo 7: Relatório de Produtividade

```tsx
'use client';
import { useRelatorioProdutividade } from '@/hooks/queries/useProducao';
import { useState } from 'react';

export function RelatorioProdutividade() {
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-02-05');

  const { data: relatorio, isLoading } = useRelatorioProdutividade(dataInicio, dataFim);

  if (isLoading) return <p>Carregando relatório...</p>;
  if (!relatorio) return null;

  return (
    <div className="border p-6 rounded space-y-6">
      <h2 className="text-2xl font-bold">Relatório de Produtividade</h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Período: {relatorio.periodo.inicio} a {relatorio.periodo.fim}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total de Conferências</p>
          <p className="text-3xl font-bold">{relatorio.totalConferencias}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Conformes</p>
          <p className="text-3xl font-bold text-green-600">{relatorio.conformes}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Taxa de Conformidade</p>
          <p className="text-3xl font-bold">{relatorio.taxaConformidade}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-3">Por Facção</h3>
        {Object.entries(relatorio.porFaccao).map(([faccao, dados]: any) => (
          <div key={faccao} className="mb-3 pb-3 border-b last:border-b-0">
            <p className="font-semibold">{faccao}</p>
            <p className="text-sm">
              Total: {dados.total} | Conforme: {dados.conforme} | 
              Defeitos: {dados.defeitos}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Estados de Query

Todos os hooks retornam os seguintes estados:

```typescript
{
  data: T | undefined;           // Dados retornados
  isLoading: boolean;             // Carregando inicial
  isPending: boolean;             // Carregando (também durante refetch)
  isError: boolean;               // Houve erro
  error: Error | null;            // Objeto do erro
  status: 'pending' | 'error' | 'success';
  isFetching: boolean;            // Fazendo requisição (initial + refetch)
  isRefetching: boolean;          // Refetch em andamento
  refetch: () => Promise<...>;    // Função para refazer a requisição
}
```

---

## 🔄 Estados de Mutation

Todos os hooks de mutação retornam:

```typescript
{
  mutate: (data) => void;         // Função para executar
  mutateAsync: (data) => Promise; // Versão async
  isPending: boolean;             // Executando
  isError: boolean;               // Houve erro
  error: Error | null;            // Objeto do erro
  status: 'idle' | 'pending' | 'error' | 'success';
  data: T | undefined;            // Última resposta bem-sucedida
  reset: () => void;              // Resetar estado
}
```

---

## 🎯 Melhores Práticas

### 1. Usar Loading States
```tsx
if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
```

### 2. Invalidar Cache após Mutação
Já feito automaticamente nos hooks! Exemplo:
```tsx
// Após criar um produto, lista é automaticamente atualizada
useCriarProduto(); // invalidates 'produtos' query
```

### 3. Usar Refetch Manual
```tsx
const { data, refetch } = useProdutos();

const handleRefresh = () => {
  refetch();
};
```

### 4. Lidar com Erros
```tsx
const { error } = useProdutos();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        {error.message || 'Erro ao carregar dados'}
      </AlertDescription>
    </Alert>
  );
}
```

### 5. Dependent Queries
```tsx
// Só executa quando tipoProdutoId está definido
const { data } = useTamanhosPorTipo(tipoProdutoId);
```

---

## 🔐 Autenticação Automática

O `APIClient` adiciona o token JWT automaticamente em todas as requisições:

```typescript
// Feito automaticamente pelo interceptor
Authorization: Bearer <token_do_cookie>
```

Se o token expirar (401), você receberá um erro tratado pelo toast.

---

## 📋 Checklist de Uso

Ao usar React Query em uma página:

- ✅ Importar hook customizado
- ✅ Verificar `isLoading` para mostrar skeleton
- ✅ Verificar `error` para mostrar mensagem
- ✅ Renderizar `data`
- ✅ Para mutações, verificar `isPending`
- ✅ Toasts são automáticos (sucesso/erro)

---

## 🚨 Troubleshooting

### Problema: "API_URL is undefined"
**Solução:** Adicione `NEXT_PUBLIC_API_URL` no `.env.local`

### Problema: Token não é enviado
**Solução:** Verifique se o cookie `auth_user_id` e `auth_token` existem

### Problema: "401 Unauthorized"
**Solução:** Faça login novamente, token expirou

### Problema: Dados não atualizam após mutação
**Solução:** Mutation já invalida cache automaticamente, pode levar 2-3 segundos

---

## 📚 Resumo Rápido

| Operação | Hook | Estado | Callback |
|----------|------|--------|----------|
| Listar | `useTiposProduto()` | `{ data, isLoading, error }` | N/A |
| Buscar | `useTipoProduto(id)` | `{ data, isLoading, error }` | N/A |
| Criar | `useCriarTipoProduto()` | `{ mutate, isPending }` | Auto toast |
| Editar | `useAtualizarTipoProduto()` | `{ mutate, isPending }` | Auto toast |
| Deletar | `useDeletarTipoProduto()` | `{ mutate, isPending }` | Auto toast |

---

**Última Atualização:** Fevereiro, 2026  
**Versão:** 1.0.0 - Pronto para Produção
