'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProduction } from '@/providers/PrivateContexts/ProductionProvider';
import { Tecido } from '@/types/production';
import { Plus, Pencil } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { FabricTable } from '@/components/Tables/Tecido/table';

export default function Tecidos() {
  const { tecidos, addTecido, updateTecido, fornecedores } = useProduction();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Tecido | null>(null);
  const [formData, setFormData] = useState({
    tipo: '',
    cor: '',
    largura: 150,
    rendimento: 2.5,
    unidade: 'kg' as const,
    fornecedorId: '',
  });

  const fornecedoresTecido = fornecedores.filter(f => f.tipo === 'tecido');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateTecido(editingItem.id, formData);
    } else {
      addTecido(formData);
    }
    setIsOpen(false);
    setEditingItem(null);
    setFormData({ tipo: '', cor: '', largura: 150, rendimento: 2.5, unidade: 'kg', fornecedorId: '' });
  };




  

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {tecidos.length} tecidos cadastrados
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setFormData({ tipo: '', cor: '', largura: 150, rendimento: 2.5, unidade: 'kg', fornecedorId: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Tecido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Tecido' : 'Novo Tecido'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Tecido</Label>
                <Input
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: Suplex, Dry Fit, Cirrê"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  placeholder="Ex: Preto, Branco, Rosa"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select
                  value={formData.fornecedorId}
                  onValueChange={(value) => setFormData({ ...formData, fornecedorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedoresTecido.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (cm)</Label>
                  <Input
                    id="largura"
                    type="number"
                    min="1"
                    value={formData.largura}
                    onChange={(e) => setFormData({ ...formData, largura: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rendimento">Rendimento (m/kg)</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.rendimento}
                    onChange={(e) => setFormData({ ...formData, rendimento: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Salvar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FabricTable
        tecido={tecidos}
        isLoading={isLoading}
        getRowId={(item) => item.id}
        setEditingItem={setEditingItem}
        setFormData={setFormData}
        setIsOpen={setIsOpen}
        fornecedores={fornecedoresTecido}      />
    </>
  );
}
