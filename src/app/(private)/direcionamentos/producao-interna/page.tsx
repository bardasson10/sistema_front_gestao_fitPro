'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetEstoqueCorte } from '@/hooks/queries/Estoque/useEstoque-Corte';
import { usePostCriarDirecionamentoProducaoInterna } from '@/hooks/queries/Direcionamento/useDirecionamento';
import { ServicesValues } from '@/types/Faccao';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Search, Package, ClipboardCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EstoqueCorte } from '@/types/EstoqueCorte';

interface ItemSelecionado {
  estoqueCorteId: string;
  quantidade: number;
  estoqueCorte: EstoqueCorte;
}

function ProducaoInternaSkeleton() {
  return (
    <main className="flex flex-col gap-6">
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-3 lg:col-span-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </main>
  );
}

function ProducaoInternaContent() {
  const router = useRouter();
  const { data: estoqueCorte } = useGetEstoqueCorte({ limit: 1000 });
  const { mutate: criarProducaoInterna, isPending } = usePostCriarDirecionamentoProducaoInterna();

  const [tipoServico, setTipoServico] = useState('');
  const [observacao, setObservacao] = useState('');
  const [busca, setBusca] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
  const [quantidadeInputs, setQuantidadeInputs] = useState<Record<string, string>>({});

  const estoquesFiltrados = useMemo(() => {
    const data = estoqueCorte ?? [];
    if (!busca) return data;

    const termo = busca.toLowerCase();
    return data.filter((item) =>
      item.produto.nome.toLowerCase().includes(termo) ||
      item.produto.sku.toLowerCase().includes(termo) ||
      item.tamanho.nome.toLowerCase().includes(termo) ||
      item.cor.nome.toLowerCase().includes(termo) ||
      item.lote.codigoLote.toLowerCase().includes(termo)
    );
  }, [busca, estoqueCorte]);

  const totalItens = useMemo(
    () => itensSelecionados.reduce((acc, item) => acc + item.quantidade, 0),
    [itensSelecionados]
  );

  const isItemSelecionado = (estoqueCorteId: string) =>
    itensSelecionados.some((item) => item.estoqueCorteId === estoqueCorteId);

  const getQuantidadeSelecionada = (estoqueCorteId: string) =>
    itensSelecionados.find((item) => item.estoqueCorteId === estoqueCorteId)?.quantidade || 0;

  const handleToggleItem = (estoque: EstoqueCorte, checked: boolean) => {
    if (checked) {
      setQuantidadeInputs((prev) => ({ ...prev, [estoque.id]: '1' }));
      setItensSelecionados((prev) => [
        ...prev,
        { estoqueCorteId: estoque.id, quantidade: 1, estoqueCorte: estoque },
      ]);
      return;
    }

    setQuantidadeInputs((prev) => {
      const next = { ...prev };
      delete next[estoque.id];
      return next;
    });
    setItensSelecionados((prev) => prev.filter((item) => item.estoqueCorteId !== estoque.id));
  };

  const handleQuantidadeChange = (estoqueCorteId: string, quantidade: number) => {
    setItensSelecionados((prev) =>
      prev.map((item) =>
        item.estoqueCorteId === estoqueCorteId
          ? { ...item, quantidade: Math.max(1, Math.min(quantidade, item.estoqueCorte.quantidadeDisponivel)) }
          : item
      )
    );
  };

  const handleQuantidadeInputChange = (estoqueCorteId: string, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;

    setQuantidadeInputs((prev) => ({ ...prev, [estoqueCorteId]: value }));

    if (value === '') return;
    handleQuantidadeChange(estoqueCorteId, Number(value));
  };

  const handleQuantidadeBlur = (estoqueCorteId: string, maxQuantidade: number) => {
    const valorAtual = quantidadeInputs[estoqueCorteId];
    const quantidadeNormalizada = Math.max(1, Math.min(Number(valorAtual || 1) || 1, maxQuantidade));

    setQuantidadeInputs((prev) => ({ ...prev, [estoqueCorteId]: String(quantidadeNormalizada) }));
    handleQuantidadeChange(estoqueCorteId, quantidadeNormalizada);
  };

  const handleRemoveItem = (estoqueCorteId: string) => {
    setQuantidadeInputs((prev) => {
      const next = { ...prev };
      delete next[estoqueCorteId];
      return next;
    });

    setItensSelecionados((prev) => prev.filter((item) => item.estoqueCorteId !== estoqueCorteId));
  };

  const handleSubmit = () => {
    if (!tipoServico || itensSelecionados.length === 0) return;

    criarProducaoInterna(
      {
        tipoServico: tipoServico.toLowerCase(),
        observacao,
        items: itensSelecionados.map((item) => ({
          estoqueCorteId: item.estoqueCorteId,
          quantidade: item.quantidade,
        })),
      },
      {
        onSuccess: async () => {
          setTipoServico('');
          setObservacao('');
          setBusca('');
          setItensSelecionados([]);
          setQuantidadeInputs({});
          router.push('/conferencia');
        },
      }
    );
  };

  const canSubmit = tipoServico && itensSelecionados.length > 0 && !isPending;

  return (
    <main className="flex flex-col gap-6">
      <div className="rounded-lg border p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Produção Interna</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma remessa interna e o sistema já aprova a conferência automaticamente.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4" />
              Configurações
            </CardTitle>
            <CardDescription>Escolha o serviço e inclua uma observação opcional</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipoServico">Tipo de Serviço</Label>
              <Select value={tipoServico} onValueChange={setTipoServico}>
                <SelectTrigger id="tipoServico">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {ServicesValues.map((tipo) => (
                    <SelectItem key={tipo} value={tipo.toLowerCase()} className="capitalize">
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                placeholder="Opcional"
                className="min-h-28"
              />
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
              {isPending ? <Spinner /> : 'Criar produção interna'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Estoque de Corte
                </CardTitle>
                <CardDescription>Selecione os itens que irão para a produção interna</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto, SKU, cor..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-105 overflow-auto rounded-md border">
              <Table className="min-w-225">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Produto</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estoquesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum item encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    estoquesFiltrados.map((estoque) => {
                      const selecionado = isItemSelecionado(estoque.id);
                      const quantidade = getQuantidadeSelecionada(estoque.id);

                      return (
                        <TableRow key={estoque.id} className={cn(selecionado && 'bg-primary/5')}>
                          <TableCell>
                            <Checkbox
                              checked={selecionado}
                              onCheckedChange={(checked) => handleToggleItem(estoque, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{estoque.produto.nome}</span>
                              <span className="text-xs text-muted-foreground">{estoque.produto.sku}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{estoque.tamanho.nome}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: estoque.cor.codigoHex }}
                              />
                              <span>{estoque.cor.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{estoque.lote.codigoLote}</span>
                              <span className="text-xs text-muted-foreground">{estoque.lote.tecido.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{estoque.quantidadeDisponivel}</TableCell>
                          <TableCell className="text-right">
                            {selecionado ? (
                              <Input
                                type="number"
                                min={1}
                                max={estoque.quantidadeDisponivel}
                                value={quantidadeInputs[estoque.id] ?? String(quantidade)}
                                onChange={(event) => handleQuantidadeInputChange(estoque.id, event.target.value)}
                                onBlur={() => handleQuantidadeBlur(estoque.id, estoque.quantidadeDisponivel)}
                                className="ml-auto h-8 w-20 text-right"
                              />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {itensSelecionados.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Itens Selecionados</CardTitle>
            <CardDescription>
              {itensSelecionados.length} item(s) - Total: {totalItens} peça(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {itensSelecionados.map((item) => (
                <Badge
                  key={item.estoqueCorteId}
                  variant="secondary"
                  className="flex items-center gap-2 py-1.5 pl-3 pr-1.5"
                >
                  <span>{item.estoqueCorte.produto.nome} - {item.estoqueCorte.tamanho.nome}</span>
                  <span className="font-semibold">({item.quantidade})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.estoqueCorteId)}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

export default function ProducaoInternaPage() {
  return (
    <Suspense fallback={<ProducaoInternaSkeleton />}>
      <ProducaoInternaContent />
    </Suspense>
  );
}