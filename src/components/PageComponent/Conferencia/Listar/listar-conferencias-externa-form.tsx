"use client"

import { useState, useMemo } from "react"
import {
  ClipboardCheck,
  Filter,
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Conferencia, ConferenciaStatusQualidade } from "@/types/Conferencia"
import { ConferenciaRow } from "./components/row-conferencia"
import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { RemessasProntasCard } from "@/components/PageComponent/Conferencia/Listar/components/remessas-prontas-card";


export interface IFiltrosConferencia {
  statusQualidade?: ConferenciaStatusQualidade;
  isProducaoInterna?: boolean;
  direcionamentoId?: string;
  faccaoId?: string;
  responsavelId?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

interface ListarConferenciasProps {
  dataConferencias: Conferencia[];
  responseRemessasProntas: DirecionamentoRemessa[];
}

export function ListarConferenciasExterna({ dataConferencias, responseRemessasProntas }: ListarConferenciasProps) {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [isProducaoInternaFiltro, setIsProducaoInternaFiltro] = useState<string>("externa")
  const [dataInicio, setDataInicio] = useState<string>("")
  const [dataFim, setDataFim] = useState<string>("")
  const [faccaoId, setFaccaoId] = useState<string>("")
  const [responsavelId, setResponsavelId] = useState<string>("")
  const [direcionamentoId, setDirecionamentoId] = useState<string>("")

  const conferenciasFiltradas = useMemo(() => {
    return dataConferencias.filter((conferencia) => {
      const matchBusca =
        !busca ||
        conferencia.direcionamento.faccao.nome.toLowerCase().includes(busca.toLowerCase()) ||
        conferencia.responsavel.nome.toLowerCase().includes(busca.toLowerCase()) ||
        conferencia.items.some(
          (item) =>
            item.produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
            item.produto.sku.toLowerCase().includes(busca.toLowerCase())
        )

      const matchStatus =
        statusFiltro === "todos" || conferencia.statusQualidade === statusFiltro

      const matchProducaoInterna =
        isProducaoInternaFiltro === "todos" ||
        (isProducaoInternaFiltro === "interna" && conferencia.isProducaoInterna) ||
        (isProducaoInternaFiltro === "externa" && !conferencia.isProducaoInterna)

      const matchDataInicio = !dataInicio || new Date(conferencia.dataConferencia) >= new Date(dataInicio)
      const matchDataFim = !dataFim || new Date(conferencia.dataConferencia) <= new Date(`${dataFim}T23:59:59`)

      const matchFaccaoId = !faccaoId || conferencia.direcionamento.faccao.id === faccaoId
      const matchResponsavelId = !responsavelId || conferencia.responsavel.id === responsavelId
      const matchDirecionamentoId = !direcionamentoId || conferencia.direcionamento.id === direcionamentoId

      return (
        matchBusca &&
        matchStatus &&
        matchProducaoInterna &&
        matchDataInicio &&
        matchDataFim &&
        matchFaccaoId &&
        matchResponsavelId &&
        matchDirecionamentoId
      )
    })
  }, [
    busca,
    statusFiltro,
    isProducaoInternaFiltro,
    dataInicio,
    dataFim,
    faccaoId,
    responsavelId,
    direcionamentoId,
    dataConferencias
  ])

  const estatisticas = useMemo(() => {
    const total = dataConferencias.length
    const recebido = dataConferencias.filter((c) => c.statusQualidade === "recebido").length
    const emConferencia = dataConferencias.filter((c) => c.statusQualidade === "em_conferencia").length
    const aprovados = dataConferencias.filter((c) => c.statusQualidade === "aprovado").length
    const aprovadosComRessalva = dataConferencias.filter(
      (c) => c.statusQualidade === "aprovado_parcial" || c.statusQualidade === "aprovado_defeito"
    ).length

    return { total, recebido, emConferencia, aprovados, aprovadosComRessalva }
  }, [dataConferencias])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Histórico - Produção Externa
          </h1>
          <p className="text-muted-foreground">
            Listagem das conferências de produção externa (sem informações financeiras)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/remessas-direcionadas">
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Ver Remessas
            </Button>
          </Link>
          <Link href="/nova-conferencia">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conferência
            </Button>
          </Link>
        </div>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {estatisticas.recebido}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Conferência
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {estatisticas.emConferencia}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprovados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {estatisticas.aprovados}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprov. c/ Ressalva
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {estatisticas.aprovadosComRessalva}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <RemessasProntasCard remessas={responseRemessasProntas} />
      </div>


      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Lista de Conferências - Produção Externa
          </CardTitle>
          <CardDescription>
            {conferenciasFiltradas.length} conferência(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Card className="rounded-md">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </CardTitle>
                    <CardDescription>
                      Encontre conferências por serviço, responsável ou datas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por serviço, responsável ou produto..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Status</SelectItem>
                        <SelectItem value="recebido">Recebido</SelectItem>
                        <SelectItem value="em_conferencia">Em Conferência</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="aprovado_parcial">Aprovado Parcial</SelectItem>
                        <SelectItem value="aprovado_defeito">Aprovado Defeito</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={isProducaoInternaFiltro} onValueChange={setIsProducaoInternaFiltro}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Produção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Toda Produção</SelectItem>
                        <SelectItem value="interna">Interna</SelectItem>
                        <SelectItem value="externa">Externa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full sm:w-[160px]"
                    />
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full sm:w-[160px]"
                    />
                    <Input
                      placeholder="ID Facção"
                      value={faccaoId}
                      onChange={(e) => setFaccaoId(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="ID Responsável"
                      value={responsavelId}
                      onChange={(e) => setResponsavelId(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="ID Direcionamento"
                      value={direcionamentoId}
                      onChange={(e) => setDirecionamentoId(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead className="text-right">Recebido/Enviado</TableHead>
                  <TableHead>Data Conferência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferenciasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhuma conferência externa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  conferenciasFiltradas.map((conferencia) => (
                    <ConferenciaRow key={conferencia.id} conferencia={conferencia} hidePagamento />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
