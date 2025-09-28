import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Dumbbell, Calendar, Users } from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
}

interface PlanoTreino {
  id: string;
  nome: string;
  descricao?: string;
  duracao_semanas: number;
  dias_semana: number;
  nivel: string;
  ativo: boolean;
  aluno_id: string;
  alunos?: { nome: string };
}

const Treinos = () => {
  const { user } = useAuth();
  const [planos, setPlanos] = useState<PlanoTreino[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoTreino | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    aluno_id: '',
    duracao_semanas: '4',
    dias_semana: '3',
    nivel: 'iniciante'
  });

  const fetchPlanos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('planos_treino')
        .select(`
          *,
          alunos!inner(nome, personal_trainer_id)
        `)
        .eq('alunos.personal_trainer_id', user.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos de treino",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlunos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('personal_trainer_id', user.id)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlanos();
      fetchAlunos();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const data = {
        ...formData,
        duracao_semanas: parseInt(formData.duracao_semanas),
        dias_semana: parseInt(formData.dias_semana)
      };

      if (editingPlano) {
        const { error } = await supabase
          .from('planos_treino')
          .update(data)
          .eq('id', editingPlano.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Plano atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('planos_treino')
          .insert([data]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Plano criado com sucesso!" });
      }

      setModalOpen(false);
      setEditingPlano(null);
      setFormData({
        nome: '',
        descricao: '',
        aluno_id: '',
        duracao_semanas: '4',
        dias_semana: '3',
        nivel: 'iniciante'
      });
      fetchPlanos();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (plano: PlanoTreino) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao || '',
      aluno_id: plano.aluno_id,
      duracao_semanas: plano.duracao_semanas.toString(),
      dias_semana: plano.dias_semana.toString(),
      nivel: plano.nivel
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('planos_treino')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Plano removido com sucesso!" });
      fetchPlanos();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o plano",
        variant: "destructive"
      });
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'avancado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-bold text-foreground">Planos de Treino</h1>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={alunos.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPlano ? 'Editar Plano' : 'Novo Plano de Treino'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="aluno_id">Aluno *</Label>
                  <Select
                    value={formData.aluno_id}
                    onValueChange={(value) => setFormData({...formData, aluno_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map((aluno) => (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          {aluno.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nome">Nome do Plano *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Treino para Hipertrofia"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descreva os objetivos e características do treino"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duracao_semanas">Duração (semanas)</Label>
                    <Input
                      id="duracao_semanas"
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duracao_semanas}
                      onChange={(e) => setFormData({...formData, duracao_semanas: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dias_semana">Dias por semana</Label>
                    <Input
                      id="dias_semana"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.dias_semana}
                      onChange={(e) => setFormData({...formData, dias_semana: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nivel">Nível</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value) => setFormData({...formData, nivel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPlano ? 'Atualizar' : 'Criar Plano'}
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
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Você precisa cadastrar alunos antes de criar planos de treino
            </p>
            <Link to="/alunos">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Alunos
              </Button>
            </Link>
          </div>
        ) : planos.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano de treino</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando planos de treino personalizados para seus alunos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <Card key={plano.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">{plano.nome}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(plano)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plano.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      Aluno: {plano.alunos?.nome}
                    </p>
                    {plano.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {plano.descricao}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {plano.duracao_semanas} semanas
                      </Badge>
                      <Badge variant="outline">
                        {plano.dias_semana}x/semana
                      </Badge>
                    </div>
                    <Badge className={getNivelColor(plano.nivel)}>
                      {plano.nivel.charAt(0).toUpperCase() + plano.nivel.slice(1)}
                    </Badge>
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

export default Treinos;