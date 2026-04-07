import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  CalendarIcon,
  DollarSign,
  Save,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { StatusQualidadeBadge } from "./statusBagde-conferencia"
import { Conferencia } from "@/types/Conferencia"
import { useAtualizarConferencia } from "@/hooks/queries/Conferencia/useConferencia"
import { toast } from "sonner"

const tipoServicoLabels: Record<string, string> = {
  costura: "Costura",
  acabamento: "Acabamento",
  bordado: "Bordado",
  estamparia: "Estamparia",
  corte: "Corte",
}

const toDateTimeLocalValue = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)

  return localDate.toISOString().slice(0, 16)
}

const getInitialDateAndTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return { date: undefined, time: "00:00" }
  }

  return {
    date,
    time: format(date, "HH:mm"),
  }
}

export const ConferenciaRow = ({ conferencia }: { conferencia: Conferencia }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [statusEdit, setStatusEdit] = useState(conferencia.statusQualidade)
  const [liberadoPagamentoEdit, setLiberadoPagamentoEdit] = useState(conferencia.liberadoPagamento)
  const initialDateAndTime = getInitialDateAndTime(conferencia.dataConferencia)
  const [dataConferenciaDateEdit, setDataConferenciaDateEdit] = useState<Date | undefined>(initialDateAndTime.date)
  const [dataConferenciaTimeEdit, setDataConferenciaTimeEdit] = useState(initialDateAndTime.time)
  const [observacaoEdit, setObservacaoEdit] = useState(conferencia.observacao ?? "")
  const [itemsEdit, setItemsEdit] = useState(
    conferencia.items.map((item) => ({
      conferenciaItemId: item.id,
      direcionamentoItemId: item.direcionamentoItemId,
      sku: item.produto.sku,
      qtdRecebida: item.qtdRecebida,
      qtdDefeito: item.qtdDefeito,
    }))
  )
  const [skuPricesEdit, setSkuPricesEdit] = useState<Record<string, number>>(
    (conferencia.pagamento?.porSku ?? []).reduce<Record<string, number>>((acc, item) => {
      acc[item.sku] = Number(item.valorUnitario)
      return acc
    }, {})
  )
  const atualizarConferencia = useAtualizarConferencia()

  const handleToggle = () => setIsOpen((prev) => !prev)
  const getQuebraItem = (quantidadeEnviada: number, qtdRecebida: number) =>
    Math.max(0, quantidadeEnviada - qtdRecebida)

  const totalEnviado = conferencia.items.reduce((acc, item) => acc + item.quantidadeEnviada, 0)
  const totalRecebido = conferencia.items.reduce((acc, item) => acc + item.qtdRecebida, 0)
  const totalDefeito = conferencia.items.reduce((acc, item) => acc + item.qtdDefeito, 0)
  const totalQuebra = conferencia.items.reduce(
    (acc, item) => acc + getQuebraItem(item.quantidadeEnviada, item.qtdRecebida),
    0
  )
  const pagamentoResumo = conferencia.pagamento

  const canEditStatusAndItems = conferencia.statusQualidade === "recebido" || conferencia.statusQualidade === "em_conferencia" || conferencia.statusQualidade === "aprovado_parcial"
  const canEditPagamento = statusEdit === "aprovado"
  const pagamentoAutoLiberado = statusEdit === "aprovado_parcial" || statusEdit === "aprovado_defeito"
  const liberadoPagamentoEfetivo = pagamentoAutoLiberado || (canEditPagamento && liberadoPagamentoEdit)

  const skuPriceList = Array.from(
    new Set(conferencia.items.map((item) => item.produto.sku).filter((sku) => sku && sku !== "-"))
  ).map((sku) => ({
    sku,
    valorFaccaoPorPeca: Number(skuPricesEdit[sku] ?? 0),
  }))

  const itensSemDirecionamentoItemId = conferencia.items.filter(
    (item) => !item.direcionamentoItemId || !item.direcionamentoItemId.trim()
  )

  const bloquearSalvarEdicao = atualizarConferencia.isPending || itensSemDirecionamentoItemId.length > 0

  const handleUpdateItem = (itemId: string, field: "qtdRecebida" | "qtdDefeito", value: number) => {
    setItemsEdit((prev) =>
      prev.map((item) => (item.conferenciaItemId === itemId ? { ...item, [field]: Math.max(0, value) } : item))
    )
  }

  const handleSalvarEdicao = () => {
    if (itensSemDirecionamentoItemId.length > 0) {
      toast.error("Nao foi possivel salvar. Existem itens sem direcionamentoItemId valido nesta conferencia.")
      return
    }

    let dataConferenciaPayload = conferencia.dataConferencia

    if (dataConferenciaDateEdit) {
      const [hours, minutes] = dataConferenciaTimeEdit.split(":").map((value) => Number(value || 0))
      const parsedDate = new Date(dataConferenciaDateEdit)
      parsedDate.setHours(hours || 0, minutes || 0, 0, 0)

      if (!Number.isNaN(parsedDate.getTime())) {
        dataConferenciaPayload = parsedDate.toISOString()
      }
    }

    atualizarConferencia.mutate({
      id: conferencia.id,
      dados: {
        responsavelId: conferencia.responsavel.id,
        dataConferencia: dataConferenciaPayload,
        statusQualidade: statusEdit,
        produtoSKU: skuPriceList,
        liberadoPagamento: liberadoPagamentoEfetivo,
        observacao: observacaoEdit,
        items: itemsEdit.map((item) => ({
          direcionamentoItemId: item.direcionamentoItemId,
          qtdRecebida: item.qtdRecebida,
          qtdDefeito: item.qtdDefeito,
        })),
      },
    })
  }

  return (
    <>
      <TableRow 
        className={cn("cursor-pointer", isOpen && "bg-muted/30")} 
        onClick={handleToggle}
      >
        <TableCell>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={(e) => { 
              e.stopPropagation()
              handleToggle()
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{conferencia.direcionamento.faccao.nome}</span>
            <span className="text-xs text-muted-foreground">
              {tipoServicoLabels[conferencia.direcionamento.tipoServico] || conferencia.direcionamento.tipoServico}
            </span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{conferencia.responsavel.nome}</span>
          </div>
        </TableCell>
        <TableCell>
          <StatusQualidadeBadge status={conferencia.statusQualidade} />
        </TableCell>
        <TableCell>
          {conferencia.liberadoPagamento ? (
            <Badge variant="outline" className="gap-1 bg-success/15 text-success border-success/30">
              <DollarSign className="h-3 w-3" />
              Liberado
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Pendente
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="font-medium">{totalRecebido}/{totalEnviado}</span>
            {totalDefeito > 0 && (
              <span className="text-xs text-destructive">
                {totalDefeito} defeito(s)
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col text-sm">
            <span>{format(new Date(conferencia.dataConferencia), "dd/MM/yyyy", { locale: ptBR })}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(conferencia.dataConferencia), "HH:mm", { locale: ptBR })}
            </span>
          </div>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-muted/20 hover:bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <div className="p-4">
              {conferencia.observacao && (
                <div className="mb-4 rounded-md bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Observação:</span> {conferencia.observacao}
                  </p>
                </div>
              )}

              <div className="mb-4 rounded-md border bg-card p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-sm font-medium text-muted-foreground">Edição da Conferência</h5>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing((prev) => !prev)}>
                    {isEditing ? "Fechar edição" : "Editar"}
                  </Button>
                </div>

                {isEditing && (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select value={statusEdit} onValueChange={(value) => setStatusEdit(value as typeof statusEdit)} disabled={!canEditStatusAndItems}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recebido">Recebido</SelectItem>
                            <SelectItem value="em_conferencia">Em Conferência</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="aprovado_parcial">Aprovado Parcial</SelectItem>
                            <SelectItem value="aprovado_defeito">Aprovado Defeito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Pagamento</Label>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <input
                            type="checkbox"
                            checked={liberadoPagamentoEfetivo}
                            onChange={(e) => setLiberadoPagamentoEdit(e.target.checked)}
                            disabled={!canEditPagamento}
                          />
                          <span className="text-sm text-muted-foreground">Editável apenas em status Aprovado</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Data da Conferência</Label>
                      <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dataConferenciaDateEdit
                                ? format(dataConferenciaDateEdit, "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione a data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dataConferenciaDateEdit}
                              onSelect={setDataConferenciaDateEdit}
                              locale={ptBR}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="time"
                          value={dataConferenciaTimeEdit}
                          onChange={(e) => setDataConferenciaTimeEdit(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Observação</Label>
                      <Textarea value={observacaoEdit} onChange={(e) => setObservacaoEdit(e.target.value)} rows={2} />
                    </div>

                    <div className="space-y-2 rounded-md border p-3">
                      <Label>Valor por peça por SKU</Label>
                      {skuPriceList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sem SKU disponível para precificação.</p>
                      ) : (
                        skuPriceList.map((skuItem) => (
                          <div key={skuItem.sku} className="grid items-center gap-2 sm:grid-cols-[1fr_180px]">
                            <span className="text-sm font-medium">{skuItem.sku}</span>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={skuPricesEdit[skuItem.sku] ?? 0}
                              onChange={(e) =>
                                setSkuPricesEdit((prev) => ({
                                  ...prev,
                                  [skuItem.sku]: Number(e.target.value || 0),
                                }))
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>

                    {itensSemDirecionamentoItemId.length > 0 && (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                        Salvar bloqueado: existem itens sem direcionamentoItemId valido para o PUT.
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button type="button" onClick={handleSalvarEdicao} disabled={bloquearSalvarEdicao}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar edição
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Itens Conferidos ({conferencia.items.length})
              </h4>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Enviado</TableHead>
                      <TableHead className="text-right">Recebido</TableHead>
                      <TableHead className="text-right">Defeito</TableHead>
                      <TableHead className="text-right">Quebra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conferencia.items.map((item) => {
                      const itemEdit = itemsEdit.find((i) => i.conferenciaItemId === item.id)

                      return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.produto.nome}</span>
                            <span className="text-xs text-muted-foreground">{item.produto.sku}</span>
                          </div>
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
                        <TableCell className="text-right">{item.quantidadeEnviada}</TableCell>
                        <TableCell className="text-right font-medium">
                          {isEditing && canEditStatusAndItems ? (
                            <Input
                              type="number"
                              min={0}
                              max={item.quantidadeEnviada}
                              value={itemEdit?.qtdRecebida ?? item.qtdRecebida}
                              onChange={(e) => handleUpdateItem(item.id, "qtdRecebida", Number(e.target.value || 0))}
                              className="ml-auto w-20 text-right"
                            />
                          ) : (
                            item.qtdRecebida
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing && canEditStatusAndItems ? (
                            <Input
                              type="number"
                              min={0}
                              max={itemEdit?.qtdRecebida ?? item.qtdRecebida}
                              value={itemEdit?.qtdDefeito ?? item.qtdDefeito}
                              onChange={(e) => handleUpdateItem(item.id, "qtdDefeito", Number(e.target.value || 0))}
                              className="ml-auto w-20 text-right"
                            />
                          ) : item.qtdDefeito > 0 ? (
                            <span className="text-destructive font-medium">{item.qtdDefeito}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {getQuebraItem(item.quantidadeEnviada, item.qtdRecebida) > 0 ? (
                            <span className="text-destructive font-medium">
                              {getQuebraItem(item.quantidadeEnviada, item.qtdRecebida)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                      )})}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex justify-end gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Enviado:</span>
                  <span className="font-medium">{totalEnviado}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Recebido:</span>
                  <span className="font-medium">{totalRecebido}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Defeitos:</span>
                  <span className={cn("font-medium", totalDefeito > 0 && "text-destructive")}>{totalDefeito}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total Quebra:</span>
                  <span className={cn("font-medium", totalQuebra > 0 && "text-destructive")}>{totalQuebra}</span>
                </div>
              </div>

              {pagamentoResumo && (
                <div className="mt-4 rounded-md border bg-card p-3">
                  <h5 className="mb-3 text-sm font-medium text-muted-foreground">Resumo Financeiro</h5>
                  <div className="mb-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-md border bg-muted/30 p-2">
                      <span className="text-xs text-muted-foreground">Total Calculado</span>
                      <p className="font-semibold">R$ {pagamentoResumo.totalCalculado.toFixed(2)}</p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-2">
                      <span className="text-xs text-muted-foreground">Valor Pago</span>
                      <p className="font-semibold">R$ {pagamentoResumo.valorPago.toFixed(2)}</p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-2">
                      <span className="text-xs text-muted-foreground">Valor a Pagar</span>
                      <p className="font-semibold">R$ {pagamentoResumo.valorAPagar.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="rounded-md border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Recebida</TableHead>
                          <TableHead className="text-right">Aprovada</TableHead>
                          <TableHead className="text-right">Valor Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagamentoResumo.porSku.map((skuResumo) => (
                          <TableRow key={skuResumo.sku}>
                            <TableCell className="font-medium">{skuResumo.sku}</TableCell>
                            <TableCell className="text-right">{skuResumo.quantidadeRecebida}</TableCell>
                            <TableCell className="text-right">{skuResumo.quantidadeAprovada}</TableCell>
                            <TableCell className="text-right">R$ {skuResumo.valorUnitario.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">R$ {skuResumo.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
