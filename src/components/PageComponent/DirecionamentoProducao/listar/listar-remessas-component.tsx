"use client"

import { useState, useMemo } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  Plus,
  Search,
  Truck,
  Users,
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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DirecionamentoRemessa } from "@/types/Direcionamento"
import { RemessaRow } from "./components/remessa-row"





interface ListarRemessasProps {
  dataRemessas: DirecionamentoRemessa[];
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (nextPage: number) => void;
  onLimitChange: (nextLimit: number) => void;
}


export function ListarRemessas({
  dataRemessas,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}: ListarRemessasProps) {
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todos")
  const [tipoServicoFiltro, setTipoServicoFiltro] = useState<string>("todos")

  const remessasFiltradas = useMemo(() => {
    return dataRemessas.filter((remessa) => {
      const matchBusca =
        !busca ||
        remessa.faccao.nome.toLowerCase().includes(busca.toLowerCase()) ||
        remessa.faccao.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
        remessa.items.some(
          (item) =>
            (item.produto?.nome ?? "").toLowerCase().includes(busca.toLowerCase()) ||
            (item.produto?.sku ?? "").toLowerCase().includes(busca.toLowerCase())
        )

      const matchStatus =
        statusFiltro === "todos" || remessa.status === statusFiltro

      const matchTipoServico =
        tipoServicoFiltro === "todos" || remessa.tipoServico === tipoServicoFiltro

      return matchBusca && matchStatus && matchTipoServico
    })
  }, [busca, statusFiltro, tipoServicoFiltro])

  const estatisticas = useMemo(() => {
    const total = dataRemessas.length
    const separadas = dataRemessas.filter((r) => r.status === "separado").length
    const emProducao = dataRemessas.filter((r) => r.status === "em_producao").length
    const entregues = dataRemessas.filter((r) => r.status === "entregue").length
    const totalPecas = dataRemessas.reduce((acc, r) => acc + r.quantidade, 0)

    return { total, separadas, emProducao, entregues, totalPecas }
  }, [dataRemessas])

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl text-balance">
            Remessas
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gerencie os direcionamentos para facções
          </p>
        </div>
        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nova Remessa
          </Button>
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Remessas
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">{estatisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Produção
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary sm:text-2xl">
              {estatisticas.emProducao}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Separadas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-warning sm:text-2xl">
              {estatisticas.separadas}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Peças
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">{estatisticas.totalPecas}</div>
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
                Encontre remessas por facção, status ou tipo de serviço
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por facção, produto ou SKU..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="separado">Separado</SelectItem>
                <SelectItem value="em_producao">Em Produção</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoServicoFiltro} onValueChange={setTipoServicoFiltro}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Tipo de Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="costura">Costura</SelectItem>
                <SelectItem value="corte">Corte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Remessas */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Lista de Remessas
          </CardTitle>
          <CardDescription>
            {totalItems} remessa(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table className="min-w-190">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Facção</TableHead>
                  <TableHead>Tipo de Serviço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Data Saída</TableHead>
                  <TableHead>Previsão Retorno</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remessasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhuma remessa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  remessasFiltradas.map((remessa) => (
                    <RemessaRow key={remessa.id} remessa={remessa} />
                  ))
                )}
              </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({totalItems} remessas)
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Linhas por página</span>
            <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="h-9 w-20">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
