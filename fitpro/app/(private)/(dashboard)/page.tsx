'use client';

import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import {
  Package,
  Scissors,
  Factory,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { dataFormatter } from '@/utils/Formatter/data-brasil-format';


export default function DashboardPage() {
  const { lotes, rolos, faccoes, tecidos } = useProduction();

  // Calculate metrics
  const lotesAbertos = lotes.filter((l) => l.status !== 'finalizado').length;
  const lotesEmProducao = lotes.filter((l) => l.status === 'em_producao').length;
  const rolosDisponiveis = rolos.filter((r) => r.status === 'disponivel').length;
  const faccoesAtivas = faccoes.filter((f) => f.status === 'ativo').length;

  // Find delayed productions
  const producaoAtrasada = lotes
    .flatMap((l) =>
      l.direcionamentos.filter((d) => {
        if (d.status === 'concluido') return false;
        const daysSinceSent =
          (new Date().getTime() - new Date(d.dataSaida).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSinceSent > 10;
      })
    ).length;

  const recentLotes = lotes.slice(0, 5);

  // Estoque por tecido
  const estoqueResumo = tecidos
    .map((tecido) => {
      const rolosTecido = rolos.filter(
        (r) => r.tecidoId === tecido.id && r.status === 'disponivel'
      );
      const pesoTotal = rolosTecido.reduce((acc, r) => acc + r.pesoKg, 0);
      return {
        id: tecido.id,
        tipo: tecido.tipo,
        cor: tecido.cor,
        rolos: rolosTecido.length,
        pesoKg: pesoTotal,
      };
    })
    .filter((e) => e.rolos > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da produção</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Lotes em Aberto"
          value={lotesAbertos}
          subtitle={`${lotesEmProducao} em produção`}
          icon={Scissors}
          variant="primary"
        />
        <MetricCard
          title="Estoque de Rolos"
          value={rolosDisponiveis}
          subtitle="Rolos disponíveis"
          icon={Package}
          variant="success"
        />
        <MetricCard
          title="Facções Ativas"
          value={faccoesAtivas}
          subtitle="Parceiros de produção"
          icon={Factory}
          variant="default"
        />
        <MetricCard
          title="Produções Atrasadas"
          value={producaoAtrasada}
          subtitle="Requer atenção"
          icon={AlertTriangle}
          variant={producaoAtrasada > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Lotes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Lotes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Lote
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Criado
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Produtos
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentLotes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-8 text-muted-foreground"
                      >
                        Nenhum lote criado
                      </td>
                    </tr>
                  ) : (
                    recentLotes.map((lote) => {
                      const statusMap = {
                        criado: { label: 'Criado', type: 'neutral' as const },
                        cortado: { label: 'Cortado', type: 'info' as const },
                        em_producao: {
                          label: 'Em Produção',
                          type: 'warning' as const,
                        },
                        finalizado: {
                          label: 'Finalizado',
                          type: 'success' as const,
                        },
                      };
                      const status = statusMap[lote.status as keyof typeof statusMap] || statusMap.criado;

                      return (
                        <tr key={lote.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <span className="font-medium text-foreground">
                              {lote.codigo}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-muted-foreground">
                              {dataFormatter(new Date(lote.dataCreacao))}
                            </span>
                          </td>
                          <td className="p-3">
                            <span>{lote.grade.length} tipos</span>
                          </td>
                          <td className="p-3">
                            <StatusBadge status={status.type}>
                              {status.label}
                            </StatusBadge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Estoque Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Estoque de Tecidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Tecido
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Cor
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Rolos
                    </th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">
                      Peso Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueResumo.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-8 text-muted-foreground"
                      >
                        Nenhum estoque disponível
                      </td>
                    </tr>
                  ) : (
                    estoqueResumo.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <span className="font-medium">{item.tipo}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{
                                backgroundColor:
                                  item.cor.toLowerCase() === 'preto'
                                    ? '#1a1a1a'
                                    : item.cor.toLowerCase() === 'branco'
                                    ? '#ffffff'
                                    : item.cor.toLowerCase() === 'rosa'
                                    ? '#f472b6'
                                    : item.cor.toLowerCase() === 'marrom'
                                    ? '#92400e'
                                    : '#6b7280',
                              }}
                            />
                            <span>{item.cor}</span>
                          </div>
                        </td>
                        <td className="p-3">{item.rolos}</td>
                        <td className="p-3">{item.pesoKg.toFixed(1)} kg</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            Status de Produção por Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lotes.filter((l) => l.status !== 'finalizado').length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Nenhum lote em produção
              </div>
            ) : (
              lotes
                .filter((l) => l.status !== 'finalizado')
                .map((lote) => (
                  <div
                    key={lote.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">
                          {lote.codigo}
                        </span>
                        <StatusBadge
                          status={
                            lote.status === 'criado'
                              ? 'neutral'
                              : lote.status === 'cortado'
                              ? 'info'
                              : lote.status === 'em_producao'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {lote.status.replace('_', ' ')}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          {lote.grade.reduce((acc, g) => acc + g.total, 0)} peças
                        </span>
                        <span>•</span>
                        <span>{lote.grade.length} produtos</span>
                        {lote.direcionamentos.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {lote.direcionamentos.length} direcionamento(s)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {lote.direcionamentos.map((d) => (
                        <StatusBadge
                          key={d.id}
                          status={
                            d.status === 'concluido'
                              ? 'success'
                              : d.status === 'atrasado'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {d.tipoProducao === 'faccao' ? 'Facção' : 'Interna'}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}