import React from "react";
import { Button } from "@/components/ui/button";
import { CircleColorView } from "@/components/ui/circle-color-view";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { BaseModal } from '@/components/Modal/base-modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, } from "lucide-react"; 
import { PaginatedResponse } from "@/hooks/queries/useColaboradores";
import { useEstoqueTecidos } from "@/hooks/queries/useEstoque";
import { useProducaoActions } from "@/hooks/use-Producao-actions";
import { Colaborador } from "@/types/production";
import { STATUS_LOTE_OPTIONS, TStatusLote } from "@/types/Lote";



interface CreateLoteFormProps {
  colaboradoresResponse: PaginatedResponse<Colaborador> | undefined;
  fecharModal: () => void;
}

export const CreateLoteForm = ({ colaboradoresResponse, fecharModal }: CreateLoteFormProps) => {
  const { handleCriarLote } = useProducaoActions();
  const { data: roloTecidoData } = useEstoqueTecidos();
  const rolosTecido = roloTecidoData || [];

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalSearch, setModalSearch] = React.useState('');
  const [modalFornecedor, setModalFornecedor] = React.useState('');
  const [modalTecido, setModalTecido] = React.useState('');
  const [modalCor, setModalCor] = React.useState('');
  const [selectedRolos, setSelectedRolos] = React.useState<string[]>([]);

  const fornecedoresFromRolos = React.useMemo(() => {
    const map = new Map<string, string>();
    rolosTecido.forEach(r => {
      const id = r.tecido?.fornecedor?.id ?? '';
      const nome = r.tecido?.fornecedor?.nome ?? '';
      if (id) map.set(id, nome);
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [rolosTecido]);

  const tecidosFromRolos = React.useMemo(() => {
    const map = new Map<string, { id: string; nome: string; corHex?: string }>();
    rolosTecido.forEach(r => {
      const t = r.tecido;
      if (t?.id) map.set(t.id, { id: t.id, nome: t.nome, corHex: t.cor?.codigoHex });
    });
    return Array.from(map.values());
  }, [rolosTecido]);

  const coresFromRolos = React.useMemo(() => {
    const map = new Map<string, { id: string; nome: string; hex?: string }>();
    rolosTecido.forEach(r => {
      const c = r.tecido?.cor;
      if (c?.id) map.set(c.id, { id: c.id, nome: c.nome, hex: c.codigoHex });
    });
    return Array.from(map.values());
  }, [rolosTecido]);

  const modalFilteredRolos = React.useMemo(() => {
    const term = modalSearch.trim().toLowerCase();
    return rolosTecido.filter(r => {
      if (modalFornecedor && r.tecido?.fornecedor?.id !== modalFornecedor) return false;
      if (modalTecido && r.tecido?.id !== modalTecido) return false;
      if (modalCor && r.tecido?.cor?.id !== modalCor) return false;
      if (!term) return true;
      return (
        (r.codigoBarraRolo || '').toLowerCase().includes(term) ||
        (r.tecido?.nome || '').toLowerCase().includes(term) ||
        (r.tecido?.fornecedor?.nome || '').toLowerCase().includes(term)
      );
    });
  }, [rolosTecido, modalSearch, modalFornecedor, modalTecido, modalCor]);

  const [formValues, setFormValues] = React.useState({
    codigoLote: '',
    responsavelId: '',
    status: 'lote_criado' as TStatusLote,
    observacao: '',
    rolos: [] as { estoqueRoloId: string; pesoReservado: number; info?: any }[],
  });

  // Função para adicionar um rolo à lista
  const addRolo = (id: string, pesoReservado: number) => {
    const roloInfo = rolosTecido.find(r => r.id === id);
    if (!roloInfo) return;
    setFormValues((prev) => {
      if (prev.rolos.some(r => r.estoqueRoloId === id)) return prev;
      return {
        ...prev,
        rolos: [...prev.rolos, { estoqueRoloId: id, pesoReservado, info: roloInfo }]
      };
    });
  };

  // Função para remover um rolo da lista
  const removeRolo = (id: string) => {
    setFormValues({
      ...formValues,
      rolos: formValues.rolos.filter(r => r.estoqueRoloId !== id)
    });
  };

  // Função para atualizar o peso de um rolo específico

  return (
    <section className="space-y-6 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id-lote">ID do Lote</Label>
          <Input
            id="id-lote"
            placeholder="Ex: LOTE-2024-001"
            value={formValues.codigoLote}
            onChange={(e) => setFormValues({ ...formValues, codigoLote: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Responsável</Label>
          <Select onValueChange={(v) => setFormValues({ ...formValues, responsavelId: v })} value={formValues.responsavelId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              {colaboradoresResponse?.data.map(col => (
                <SelectItem key={col.id} value={col.id}>{col.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status do Processo</Label>
        <Select onValueChange={(v) => setFormValues({ ...formValues, status: v as TStatusLote })} value={formValues.status}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {
              Object.entries(STATUS_LOTE_OPTIONS).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={formValues.observacao}
          onChange={(e) => setFormValues({ ...formValues, observacao: e.target.value })}
          placeholder="Detalhes técnicos ou avisos..."
        />
      </div>

      <hr className="my-6" />

      {/* SEÇÃO DE MULTISELEÇÃO DE ROLOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold text-primary">Tecidos / Rolos Selecionados</Label>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {formValues.rolos.length} selecionado(s)
          </span>
        </div>

        <div className="space-y-2">
          <Select onValueChange={(id) => {
            const roloInfo = rolosTecido.find(rol => rol.id === id);
            if (roloInfo) {
              addRolo(id, parseFloat(roloInfo.pesoAtualKg));
            }
          }}>
            <SelectTrigger className="w-full border-dashed border-2">
              <SelectValue placeholder="🔍 Clique para buscar e adicionar rolos..." />
            </SelectTrigger>
            <SelectContent>
              {rolosTecido.filter(rol => parseFloat(rol.pesoAtualKg) > 0).flatMap(rol => (
                <SelectItem key={rol.id} value={rol.id} disabled={formValues.rolos.some(r => r.estoqueRoloId === rol.id)}>
                  <div className="flex items-center gap-2">
                    <CircleColorView color={rol.tecido.cor?.codigoHex} />
                    <span>{rol.codigoBarraRolo} - {rol.tecido.nome} ({rol.pesoAtualKg}kg disponível)</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)} className="w-full">Abrir lista completa</Button>
          </div>

          <BaseModal
            open={isModalOpen}
            onOpenChange={(open) => { if (!open) { setSelectedRolos([]); } setIsModalOpen(open); }}
            title="Selecionar Rolos"
            trigger={undefined}
          >
            <div className="space-y-4 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Input className="w-full" placeholder="Buscar..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} />
                <Select value={modalFornecedor} onValueChange={(v) => setModalFornecedor(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {fornecedoresFromRolos.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={modalTecido} onValueChange={(v) => setModalTecido(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tecido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {tecidosFromRolos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={modalCor} onValueChange={(v) => setModalCor(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todos</SelectItem>
                    {coresFromRolos.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Checkbox checked={selectedRolos.length === modalFilteredRolos.length && modalFilteredRolos.length>0} onCheckedChange={(v) => {
                        if (v) setSelectedRolos(modalFilteredRolos.map(r=>r.id)); else setSelectedRolos([]);
                      }} /></TableHead>
                      <TableHead>Codigo</TableHead>
                      <TableHead>Tecido</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalFilteredRolos.map((rol) => (
                      <TableRow key={rol.id}>
                        <TableCell>
                          <Checkbox checked={selectedRolos.includes(rol.id)} onCheckedChange={(v) => {
                            if (v) setSelectedRolos(prev => Array.from(new Set([...prev, rol.id])));
                            else setSelectedRolos(prev => prev.filter(id => id !== rol.id));
                          }} />
                        </TableCell>
                        <TableCell>{rol.codigoBarraRolo}</TableCell>
                        <TableCell className="flex items-center gap-2"><CircleColorView color={rol.tecido?.cor?.codigoHex} />{rol.tecido?.nome}</TableCell>
                        <TableCell>{rol.tecido?.fornecedor?.nome ?? '-'}</TableCell>
                        <TableCell>{rol.pesoAtualKg}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setSelectedRolos([]); setIsModalOpen(false); }}>Cancelar</Button>
                <Button onClick={() => {
                  selectedRolos.forEach(id => {
                    const ro = rolosTecido.find(r => r.id === id);
                    if (ro && !formValues.rolos.some(rr => rr.estoqueRoloId === id)) {
                      addRolo(id, parseFloat(ro.pesoAtualKg));
                    }
                  });
                  setSelectedRolos([]);
                  setIsModalOpen(false);
                }}>Adicionar selecionados</Button>
              </div>
            </div>
          </BaseModal>
        </div>

        {/* LISTA DE ROLOS ADICIONADOS */}
        <div className="grid gap-3">
          {formValues.rolos.map((item) => (
            <div key={item.estoqueRoloId} className="flex items-end gap-4 p-3 border rounded-lg bg-card shadow-sm animate-in fade-in-50">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{item.info?.codigoBarraRolo} - {item.info?.tecido.nome}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CircleColorView color={item.info?.tecido.cor?.codigoHex}  />
                  <span>Estoque: {item.info?.pesoAtualKg}kg</span>
                </div>
              </div>

              <div className="w-32 space-y-1">
                <Label className="text-[10px] uppercase">Peso p/ Lote</Label>
                <Input
                  type="number"
                  size={1}
                  className="h-8"
                  placeholder="0.00"
                  value={item.pesoReservado || ''}
                  disabled={true} // Desabilitado para evitar edição manual, já que o peso é reservado com base na quantidade planejada
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeRolo(item.estoqueRoloId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {formValues.rolos.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
              Nenhum rolo adicionado ao lote ainda.
            </div>
          )}
        </div>
      </div>

      <Button
        className="w-full mt-4"
        onClick={() => {
          handleCriarLote(formValues);
          fecharModal();
        }}
        disabled={formValues.rolos.length === 0 || !formValues.codigoLote}
      >
        Criar Lote de Produção
      </Button>
    </section>
  );
}