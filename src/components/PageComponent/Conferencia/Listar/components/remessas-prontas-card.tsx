"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { DirecionamentoRemessa } from "@/types/Direcionamento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RemessasProntasCardProps {
  remessas: DirecionamentoRemessa[];
}

export function RemessasProntasCard({ remessas }: RemessasProntasCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4" />
          Remessas Prontas para Conferir
        </CardTitle>
        <CardDescription>
          Selecione uma remessa para abrir a conferência já com os dados preenchidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facção</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {remessas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                    Nenhuma remessa pronta para conferir
                  </TableCell>
                </TableRow>
              ) : (
                remessas.map((remessa) => (
                  <TableRow key={remessa.id}>
                    <TableCell className="font-medium">{remessa.faccao.nome}</TableCell>
                    <TableCell>{remessa.tipoServico}</TableCell>
                    <TableCell className="text-right">{remessa.quantidade}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {remessa.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/nova-conferencia/${remessa.id}`}>
                        <Button size="sm">Conferir</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
