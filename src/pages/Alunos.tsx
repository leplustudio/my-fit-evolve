import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, User } from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  altura?: number;
  peso?: number;
  objetivo?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
}

const Alunos = () => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    altura: '',
    peso: '',
    objetivo: '',
    observacoes: ''
  });

  const fetchAlunos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('personal_trainer_id', user.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        ...formData,
        personal_trainer_id: user.id,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        data_nascimento: formData.data_nascimento || null
      };

      if (editingAluno) {
        const { error } = await supabase
          .from('alunos')
          .update(data)
          .eq('id', editingAluno.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Aluno atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('alunos')
          .insert([data]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Aluno cadastrado com sucesso!" });
      }

      setModalOpen(false);
      setEditingAluno(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        altura: '',
        peso: '',
        objetivo: '',
        observacoes: ''
      });
      fetchAlunos();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aluno",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormData({
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone || '',
      data_nascimento: aluno.data_nascimento || '',
      altura: aluno.altura?.toString() || '',
      peso: aluno.peso?.toString() || '',
      objetivo: aluno.objetivo || '',
      observacoes: aluno.observacoes || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Aluno removido com sucesso!" });
      fetchAlunos();
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aluno",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Alunos</h1>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura">Altura (m)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.01"
                      placeholder="1.75"
                      value={formData.altura}
                      onChange={(e) => setFormData({...formData, altura: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={formData.peso}
                      onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="objetivo">Objetivo</Label>
                  <Input
                    id="objetivo"
                    placeholder="Ex: Perda de peso, ganho de massa muscular"
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    rows={3}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAluno ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {alunos.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seus primeiros alunos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alunos.map((aluno) => (
              <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(aluno)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(aluno.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{aluno.email}</p>
                    {aluno.telefone && (
                      <p className="text-sm text-muted-foreground">{aluno.telefone}</p>
                    )}
                    {aluno.altura && aluno.peso && (
                      <div className="flex space-x-4">
                        <Badge variant="secondary">{aluno.altura}m</Badge>
                        <Badge variant="secondary">{aluno.peso}kg</Badge>
                      </div>
                    )}
                    {aluno.objetivo && (
                      <p className="text-sm mt-2">
                        <strong>Objetivo:</strong> {aluno.objetivo}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Alunos;