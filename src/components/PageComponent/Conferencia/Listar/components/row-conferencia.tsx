import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
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
import { cn } from "@/lib/utils"
import { StatusQualidadeBadge } from "./statusBagde-conferencia"
import { Conferencia } from "@/types/Conferencia"

const tipoServicoLabels: Record<string, string> = {
  costura: "Costura",
  acabamento: "Acabamento",
  bordado: "Bordado",
  estamparia: "Estamparia",
  corte: "Corte",
}

export const ConferenciaRow = ({ conferencia }: { conferencia: Conferencia }) => {
  const [isOpen, setIsOpen] = useState(false)

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
                    {conferencia.items.map((item) => (
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
                        <TableCell className="text-right font-medium">{item.qtdRecebida}</TableCell>
                        <TableCell className="text-right">
                          {item.qtdDefeito > 0 ? (
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
                    ))}
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
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
