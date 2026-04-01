"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ArrowLeft,
  CalendarIcon,
  ClipboardCheck,
  Package,
  Search,
  AlertTriangle,
  Save,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"

import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { Conferencia, ConferenciaRequestBodyPayload } from "@/types/Conferencia"
import { UseMutateFunction } from "@tanstack/react-query"
import { Spinner } from "@/components/ui/spinner"
import { PaginatedResponse } from "@/types/production"


interface ItemConferencia {
  direcionamentoItemId: string;
  produto: {
    nome: string;
    sku: string;
  }
  tamanho: string;
  cor: { nome: string; codigoHex: string; }
  lote: string;
  quantidadeEnviada: number;
  qtdRecebida: number;
  qtdDefeito: number;
}

type RemessaItemCompat = {
  id?: string;
  direcionamentoItemId?: string;
  quantidade?: number;
  produto?: {
    nome?: string;
    sku?: string;
    tamanho?: string;
    cor?: { nome?: string; codigoHex?: string };
  };
  lote?: { codigoLote?: string };
  estoqueCorte?: {
    produto?: { nome?: string; sku?: string };
    tamanho?: { nome?: string };
    cor?: { nome?: string; codigoHex?: string };
    lote?: { codigoLote?: string };
  };
}



const statusQualidadeOptions = [
  { value: "validando", label: "Validando" },
  { value: "conforme", label: "Aprovado" },
  { value: "nao_conforme", label: "Reprovado" },
  { value: "com_defeito", label: "Com Defeito" },
]

const tipoServicoLabels: Record<string, string> = {
  costura: "Costura",
  acabamento: "Acabamento",
  bordado: "Bordado",
  estamparia: "Estamparia",
  corte: "Corte",
}

interface CriarConferenciaFormProps {
  dataRemessas: DirecionamentoRemessa[];
  dataResponsaveis: { id: string; nome: string }[];
  criarConferencia: UseMutateFunction<{
    data: Conferencia;
    pagination: PaginatedResponse;
  }, any, ConferenciaRequestBodyPayload, unknown>;
  isPending: boolean;
  initialRemessaId?: string;

}

export function CriarConferenciaForm({ dataRemessas, dataResponsaveis, criarConferencia, isPending, initialRemessaId }: CriarConferenciaFormProps) {
  const router = useRouter()
  const isDirectByIdMode = Boolean(initialRemessaId)

  const getNomeProduto = (item: RemessaItemCompat) =>
    item.produto?.nome ?? item.estoqueCorte?.produto?.nome ?? "Produto"

  const getSkuProduto = (item: RemessaItemCompat) =>
    item.produto?.sku ?? item.estoqueCorte?.produto?.sku ?? "-"

  const getTamanhoProduto = (item: RemessaItemCompat) =>
    item.produto?.tamanho ?? item.estoqueCorte?.tamanho?.nome ?? "-"

  const getCorProduto = (item: RemessaItemCompat) => ({
    nome: item.produto?.cor?.nome ?? item.estoqueCorte?.cor?.nome ?? "-",
    codigoHex: item.produto?.cor?.codigoHex ?? item.estoqueCorte?.cor?.codigoHex ?? "#D4D4D8",
  })

  const getLoteCodigo = (item: RemessaItemCompat) =>
    item.lote?.codigoLote ?? item.estoqueCorte?.lote?.codigoLote ?? "-"


  // Filtra apenas remessas que podem ser conferidas
  const remessasDisponiveis = useMemo(() => {
    if (isDirectByIdMode) {
      return dataRemessas
    }

    const statusPermitidos = ["enviado", "em_producao", "concluido", "entregue"]
    return dataRemessas.filter((r) => {
      if (initialRemessaId && r.id === initialRemessaId) return true
      return statusPermitidos.includes(r.status)
    })
  }, [dataRemessas, initialRemessaId, isDirectByIdMode])

  const [remessaSelecionadaId, setRemessaSelecionadaId] = useState<string>("")
  const [responsavelId, setResponsavelId] = useState<string>("")
  const [dataConferencia, setDataConferencia] = useState<Date>(new Date())
  const [statusQualidade, setStatusQualidade] = useState<string>("validando")
  const [liberadoPagamento, setLiberadoPagamento] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [itensConferencia, setItensConferencia] = useState<ItemConferencia[]>([])
  const [busca, setBusca] = useState("")

  const remessaSelecionada = useMemo(() => {
    return remessasDisponiveis.find((r) => r.id === remessaSelecionadaId)
  }, [remessasDisponiveis, remessaSelecionadaId])

  const handleSelectRemessa = (remessaId: string) => {
    setRemessaSelecionadaId(remessaId)
    const remessa = remessasDisponiveis.find((r) => r.id === remessaId)
    if (remessa) {
      const itensNormalizados = (remessa.items ?? [])
        .map((item) => {
          const itemCompat = item as unknown as RemessaItemCompat
          const direcionamentoItemId = itemCompat.id ?? itemCompat.direcionamentoItemId

          if (!direcionamentoItemId) return null

          return {
            direcionamentoItemId,
            produto: {
              nome: getNomeProduto(itemCompat),
              sku: getSkuProduto(itemCompat),
            },
            tamanho: getTamanhoProduto(itemCompat),
            cor: getCorProduto(itemCompat),
            lote: getLoteCodigo(itemCompat),
            quantidadeEnviada: itemCompat.quantidade ?? 0,
            qtdRecebida: itemCompat.quantidade ?? 0,
            qtdDefeito: 0,
          }
        })
        .filter((item): item is ItemConferencia => item !== null)

      setItensConferencia(
        itensNormalizados
      )
    }
  }

  useEffect(() => {
    if (!isDirectByIdMode) return;
    if (remessaSelecionadaId) return;
    if (!remessasDisponiveis.length) return;

    const remessaByParam = initialRemessaId
      ? remessasDisponiveis.find((remessa) => remessa.id === initialRemessaId)
      : undefined;

    const remessaAlvo = remessaByParam || remessasDisponiveis[0];
    handleSelectRemessa(remessaAlvo.id);
  }, [
    initialRemessaId,
    isDirectByIdMode,
    remessaSelecionadaId,
    remessasDisponiveis,
  ]);

  const handleUpdateItem = (
    itemId: string,
    field: "qtdRecebida" | "qtdDefeito",
    value: number
  ) => {
    setItensConferencia((prev) =>
      prev.map((item) =>
        item.direcionamentoItemId === itemId
          ? { ...item, [field]: Math.max(0, value) }
          : item
      )
    )
  }

  const remessasFiltradas = useMemo(() => {
    if (!busca) return remessasDisponiveis
    return remessasDisponiveis.filter(
      (r) =>
        r.faccao.nome.toLowerCase().includes(busca.toLowerCase()) ||
        r.items.some((item) =>
          getNomeProduto(item as unknown as RemessaItemCompat).toLowerCase().includes(busca.toLowerCase())
        )
    )
  }, [remessasDisponiveis, busca])

  const totais = useMemo(() => {
    const enviado = itensConferencia.reduce((acc, item) => acc + item.quantidadeEnviada, 0)
    const recebido = itensConferencia.reduce((acc, item) => acc + item.qtdRecebida, 0)
    const defeito = itensConferencia.reduce((acc, item) => acc + item.qtdDefeito, 0)
    const quebra = enviado - recebido
    return { enviado, recebido, defeito, quebra }
  }, [itensConferencia])

  const canSubmit =
    remessaSelecionadaId && responsavelId && dataConferencia && statusQualidade

  const handleSubmit = () => {
    if (!canSubmit) return

    const payload: ConferenciaRequestBodyPayload = {
      direcionamentoId: remessaSelecionadaId,
      responsavelId,
      dataConferencia: dataConferencia.toISOString(),
      statusQualidade,
      liberadoPagamento,
      observacao,
      items: itensConferencia.map((item) => ({
        direcionamentoItemId: item.direcionamentoItemId,
        qtdRecebida: item.qtdRecebida,
        qtdDefeito: item.qtdDefeito,
      })),
    }

    // Chama a mutação para criar a conferência
    criarConferencia(payload, {
      onSuccess: () => {
        router.push("/conferencia")
      },
    });

  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/conferencia">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Nova Conferencia
            </h1>
            <p className="text-muted-foreground">
              Confira os itens recebidos de uma remessa
            </p>
          </div>
        </div>
      </div>

      {isDirectByIdMode ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Remessa Selecionada
            </CardTitle>
            <CardDescription>
              Dados da remessa escolhida, configurações da conferência e itens para validação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {remessaSelecionada ? (
              <>
                <div className="rounded-lg border bg-card p-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Facção</p>
                      <p className="font-medium">{remessaSelecionada.faccao.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Serviço</p>
                      <p className="font-medium">{tipoServicoLabels[remessaSelecionada.tipoServico] || remessaSelecionada.tipoServico}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quantidade</p>
                      <p className="font-medium">{remessaSelecionada.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Data Saída</p>
                      <p className="font-medium">
                        {remessaSelecionada.dataSaida
                          ? format(new Date(remessaSelecionada.dataSaida), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Configurações
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Responsavel</Label>
                      <Select value={responsavelId} onValueChange={setResponsavelId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsavel" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataResponsaveis.map((resp) => (
                            <SelectItem key={resp.id} value={resp.id}>
                              {resp.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data da Conferencia</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dataConferencia && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataConferencia
                              ? format(dataConferencia, "dd/MM/yyyy", { locale: ptBR })
                              : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataConferencia}
                            onSelect={(date) => date && setDataConferencia(date)}
                            locale={ptBR}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Status de Qualidade</Label>
                      <Select value={statusQualidade} onValueChange={setStatusQualidade}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusQualidadeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Liberar Pagamento</Label>
                        <p className="text-xs text-muted-foreground">
                          Aprovar para pagamento da faccao
                        </p>
                      </div>
                      <Switch
                        checked={liberadoPagamento}
                        onCheckedChange={setLiberadoPagamento}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Observacao</Label>
                      <Textarea
                        placeholder="Adicione observacoes sobre a conferencia..."
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border bg-card p-4">
                  <div>
                    <h3 className="text-base font-semibold">Itens para Conferencia</h3>
                    <p className="text-sm text-muted-foreground">
                      Informe a quantidade recebida e defeitos de cada item
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto">
                      <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Enviado</TableHead>
                    <TableHead className="text-right w-32">Recebido</TableHead>
                    <TableHead className="text-right w-32">Defeito</TableHead>
                    <TableHead className="text-right">Quebra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensConferencia.map((item) => {
                    const quebra = item.quantidadeEnviada - item.qtdRecebida
                    return (
                      <TableRow key={item.direcionamentoItemId}>
                        <TableCell>
                          <span className="font-medium">{item.produto.nome} - {item.produto.sku}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.tamanho}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: item.cor.codigoHex }}
                            />
                            <span>{item.cor.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.lote}</TableCell>
                        <TableCell className="text-right">
                          {item.quantidadeEnviada}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            max={item.quantidadeEnviada}
                            value={item.qtdRecebida}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.direcionamentoItemId,
                                "qtdRecebida",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            max={item.qtdRecebida}
                            value={item.qtdDefeito}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.direcionamentoItemId,
                                "qtdDefeito",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {quebra > 0 ? (
                            <span className="text-destructive font-medium">{quebra}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Totais */}
                  <div className="flex flex-wrap items-center justify-end gap-6 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Enviado:</span>
                <span className="font-semibold">{totais.enviado}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Recebido:</span>
                <span className="font-semibold">{totais.recebido}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Defeitos:</span>
                <span className={cn("font-semibold", totais.defeito > 0 && "text-destructive")}>
                  {totais.defeito}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Quebra:</span>
                <span className={cn("font-semibold", totais.quebra > 0 && "text-destructive")}>
                  {totais.quebra}
                </span>
              </div>
            </div>

                  {totais.quebra > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Atencao: Existe uma diferenca de {totais.quebra} peca(s) entre o enviado e o recebido.
                </span>
              </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Remessa não encontrada para conferência.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Selecao de Remessa */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Selecionar Remessa
              </CardTitle>
              <CardDescription>
                Escolha a remessa que deseja conferir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por faccao ou produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-64 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Faccao</TableHead>
                      <TableHead>Servico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead>Data Saida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {remessasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-16 text-center text-muted-foreground">
                          Nenhuma remessa disponivel
                        </TableCell>
                      </TableRow>
                    ) : (
                      remessasFiltradas.map((remessa) => (
                        <TableRow
                          key={remessa.id}
                          className={cn(
                            "cursor-pointer",
                            remessaSelecionadaId === remessa.id && "bg-primary/10"
                          )}
                          onClick={() => handleSelectRemessa(remessa.id)}
                        >
                          <TableCell>
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border-2",
                                remessaSelecionadaId === remessa.id
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              )}
                            >
                              {remessaSelecionadaId === remessa.id && (
                                <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{remessa.faccao.nome}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {tipoServicoLabels[remessa.tipoServico] || remessa.tipoServico}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                remessa.status === "enviado"
                                  ? "bg-warning/15 text-warning border-warning/30"
                                  : remessa.status === "em_producao"
                                    ? "bg-primary/15 text-primary border-primary/30"
                                    : "bg-success/15 text-success border-success/30"
                              )}
                            >
                              {remessa.status === "enviado"
                                ? "Enviado"
                                : remessa.status === "em_producao"
                                  ? "Em Producao"
                                  : "Concluido"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {remessa.quantidade}
                          </TableCell>
                          <TableCell>
                            {format(new Date(remessa.dataSaida), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Configuracoes da Conferencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4 w-4" />
                Configuracoes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Responsavel</Label>
                <Select value={responsavelId} onValueChange={setResponsavelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsavel" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataResponsaveis.map((resp) => (
                      <SelectItem key={resp.id} value={resp.id}>
                        {resp.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data da Conferencia</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataConferencia && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataConferencia
                        ? format(dataConferencia, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataConferencia}
                      onSelect={(date) => date && setDataConferencia(date)}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Status de Qualidade</Label>
                <Select value={statusQualidade} onValueChange={setStatusQualidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusQualidadeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Liberar Pagamento</Label>
                  <p className="text-xs text-muted-foreground">
                    Aprovar para pagamento da faccao
                  </p>
                </div>
                <Switch
                  checked={liberadoPagamento}
                  onCheckedChange={setLiberadoPagamento}
                />
              </div>

              <div className="space-y-2">
                <Label>Observacao</Label>
                <Textarea
                  placeholder="Adicione observacoes sobre a conferencia..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botao Salvar */}
      <div className="flex justify-end gap-4">
        <Link href="/conferencias">
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isPending ? (
            <Spinner />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Conferencia
        </Button>
      </div>
    </div>
  )
}
