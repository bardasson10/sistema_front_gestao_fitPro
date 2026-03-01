
import { LoteProducaoFormValues } from "@/schemas/LoteProducao/lote-producao-schemas";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Colaborador } from "@/types/production";
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ApiLoteProducaoResponse } from "@/hooks/queries/useProducao";

interface DadosLoteFormProps {
  form: UseFormReturn<LoteProducaoFormValues>;
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  handleEditLoteCabeçalho: (id: string, values: ApiLoteProducaoResponse) => Promise<void>
}

export const DadosLoteForm = ({ form, colaboradoresResponse, handleEditLoteCabeçalho }: DadosLoteFormProps) => {
  const colaboradores = Array.isArray(colaboradoresResponse)
    ? colaboradoresResponse
    : (colaboradoresResponse?.data || []);

  return (
    <section className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ID do Lote</Label>
        <Input value={form.getValues().codigoLote} className="bg-muted" onChange={(e) => form.setValue("codigoLote", e.target.value)} />
      </div>


      <div>
        <Label>Responsável</Label>
        <Select onValueChange={(value) => form.setValue("responsavel.id", value)} value={form.getValues().responsavel?.id || undefined}>
          <SelectTrigger disabled={colaboradores.length === 0}>
            <SelectValue placeholder="Selecione um responsável" />
          </SelectTrigger>
          <SelectContent>
            {colaboradores.map(col => (
              <SelectItem key={col.id} value={col.id}>{col.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Campo: Status */}
      <div>
        <Label>Status</Label>
        <Select onValueChange={(value) => form.setValue("status", value)} value={form.getValues().status || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planejado">Planejado</SelectItem>
            <SelectItem value="em_producao">Em produção</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campo: Observação */}
      <div>
        <Label>Observação</Label>
        <Textarea {...form.register("observacao")} onChange={(value) => form.setValue("observacao", value.target.value)} placeholder="Digite uma observação" />
      </div>

      <div>
        <Button type="button" onClick={() => handleEditLoteCabeçalho(form.getValues().id!, form.getValues() as ApiLoteProducaoResponse)}>
          Atualizar Cabeçalho do Lote
        </Button>
      </div>
    </section>
  );
};