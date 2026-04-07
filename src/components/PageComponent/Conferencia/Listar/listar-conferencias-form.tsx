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
  DollarSign,
  PackageCheck,
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
import type { Conferencia } from "@/types/Conferencia"
import { ConferenciaRow } from "./components/row-conferencia"


interface ListarConferenciasProps {
  dataConferencias: Conferencia[]
}


  export function ListarConferencias({ dataConferencias }: ListarConferenciasProps) {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [pagamentoFiltro, setPagamentoFiltro] = useState<string>("todos")

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

      const matchPagamento =
        pagamentoFiltro === "todos" ||
        (pagamentoFiltro === "liberado" && conferencia.liberadoPagamento) ||
        (pagamentoFiltro === "pendente" && !conferencia.liberadoPagamento)

      return matchBusca && matchStatus && matchPagamento
    })
  }, [busca, statusFiltro, pagamentoFiltro])

  const estatisticas = useMemo(() => {
    const total = dataConferencias.length
    const recebido = dataConferencias.filter((c) => c.statusQualidade === "recebido").length
    const emConferencia = dataConferencias.filter((c) => c.statusQualidade === "em_conferencia").length
    const aprovados = dataConferencias.filter((c) => c.statusQualidade === "aprovado").length
    const aprovadosComRessalva = dataConferencias.filter(
      (c) => c.statusQualidade === "aprovado_parcial" || c.statusQualidade === "aprovado_defeito"
    ).length
    const liberadosPagamento = dataConferencias.filter((c) => c.liberadoPagamento).length

    return { total, recebido, emConferencia, aprovados, aprovadosComRessalva, liberadosPagamento }
  }, [dataConferencias])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Conferencias
          </h1>
          <p className="text-muted-foreground">
            Gerencie as conferencias de remessas retornadas
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
              Nova Conferencia
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
            <PackageCheck className="h-4 w-4 text-primary" />
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
              Em Conferencia
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagto. Liberado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {estatisticas.liberadosPagamento}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
              <CardDescription>
                Encontre conferencias por faccao, responsavel ou status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por faccao, responsavel ou produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="em_conferencia">Em Conferencia</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="aprovado_parcial">Aprovado Parcial</SelectItem>
                <SelectItem value="aprovado_defeito">Aprovado Defeito</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pagamentoFiltro} onValueChange={setPagamentoFiltro}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="liberado">Liberado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Conferencias */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Lista de Conferencias
          </CardTitle>
          <CardDescription>
            {conferenciasFiltradas.length} conferencia(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Faccao / Servico</TableHead>
                  <TableHead>Responsavel</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Recebido/Enviado</TableHead>
                  <TableHead>Data Conferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferenciasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhuma conferencia encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  conferenciasFiltradas.map((conferencia) => (
                    <ConferenciaRow key={conferencia.id} conferencia={conferencia} />
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
