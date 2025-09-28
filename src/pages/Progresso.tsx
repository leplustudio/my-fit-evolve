import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, TrendingUp, Users, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Aluno {
  id: string;
  nome: string;
}

interface ProgressoData {
  id: string;
  aluno_id: string;
  data_registro: string;
  peso?: number;
  percentual_gordura?: number;
  massa_muscular?: number;
  medidas?: any;
  observacoes?: string;
  alunos?: { nome: string };
}

const Progresso = () => {
  const { user } = useAuth();
  const [progressos, setProgressos] = useState<ProgressoData[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    aluno_id: '',
    data_registro: new Date().toISOString().split('T')[0],
    peso: '',
    percentual_gordura: '',
    massa_muscular: '',
    bicep: '',
    cintura: '',
    coxa: '',
    observacoes: ''
  });

  const fetchProgressos = async (alunoId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('progresso')
        .select(`
          *,
          alunos!inner(nome, personal_trainer_id)
        `)
        .eq('alunos.personal_trainer_id', user.id)
        .order('data_registro', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProgressos(data || []);
    } catch (error) {
      console.error('Erro ao buscar progressos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o progresso",
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
      fetchAlunos();
      fetchProgressos(selectedAluno);
    }
  }, [user, selectedAluno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const medidas: any = {};
      if (formData.bicep) medidas.bicep = parseFloat(formData.bicep);
      if (formData.cintura) medidas.cintura = parseFloat(formData.cintura);
      if (formData.coxa) medidas.coxa = parseFloat(formData.coxa);

      const data = {
        aluno_id: formData.aluno_id,
        data_registro: formData.data_registro,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
        massa_muscular: formData.massa_muscular ? parseFloat(formData.massa_muscular) : null,
        medidas: Object.keys(medidas).length > 0 ? medidas : null,
        observacoes: formData.observacoes || null
      };

      const { error } = await supabase
        .from('progresso')
        .insert([data]);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Progresso registrado com sucesso!" });
      setModalOpen(false);
      setFormData({
        aluno_id: '',
        data_registro: new Date().toISOString().split('T')[0],
        peso: '',
        percentual_gordura: '',
        massa_muscular: '',
        bicep: '',
        cintura: '',
        coxa: '',
        observacoes: ''
      });
      fetchProgressos(selectedAluno);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso",
        variant: "destructive"
      });
    }
  };

  const getChartData = () => {
    if (!selectedAluno || progressos.length === 0) return [];
    
    return progressos
      .filter(p => p.aluno_id === selectedAluno)
      .reverse()
      .map(p => ({
        data: new Date(p.data_registro).toLocaleDateString('pt-BR'),
        peso: p.peso,
        gordura: p.percentual_gordura,
        massa: p.massa_muscular
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = getChartData();

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
            <h1 className="text-2xl font-bold text-foreground">Acompanhar Progresso</h1>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={alunos.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Progresso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Progresso</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="data_registro">Data *</Label>
                    <Input
                      id="data_registro"
                      type="date"
                      value={formData.data_registro}
                      onChange={(e) => setFormData({...formData, data_registro: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={formData.peso}
                      onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentual_gordura">% Gordura</Label>
                    <Input
                      id="percentual_gordura"
                      type="number"
                      step="0.1"
                      value={formData.percentual_gordura}
                      onChange={(e) => setFormData({...formData, percentual_gordura: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="massa_muscular">Massa Muscular (kg)</Label>
                    <Input
                      id="massa_muscular"
                      type="number"
                      step="0.1"
                      value={formData.massa_muscular}
                      onChange={(e) => setFormData({...formData, massa_muscular: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medidas (cm)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="bicep" className="text-xs">Bícep</Label>
                      <Input
                        id="bicep"
                        type="number"
                        step="0.1"
                        value={formData.bicep}
                        onChange={(e) => setFormData({...formData, bicep: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cintura" className="text-xs">Cintura</Label>
                      <Input
                        id="cintura"
                        type="number"
                        step="0.1"
                        value={formData.cintura}
                        onChange={(e) => setFormData({...formData, cintura: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coxa" className="text-xs">Coxa</Label>
                      <Input
                        id="coxa"
                        type="number"
                        step="0.1"
                        value={formData.coxa}
                        onChange={(e) => setFormData({...formData, coxa: e.target.value})}
                      />
                    </div>
                  </div>
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
                  <Button type="submit">Registrar</Button>
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
              Você precisa cadastrar alunos antes de acompanhar o progresso
            </p>
            <Link to="/alunos">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Alunos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filtro por Aluno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Selecionar Aluno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Selecione um aluno para ver o progresso" />
                  </SelectTrigger>
                  <SelectContent>
                    {alunos.map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Gráficos */}
            {selectedAluno && chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Composição Corporal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="gordura" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          name="% Gordura"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="massa" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          name="Massa Muscular"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lista de Registros */}
            {selectedAluno && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Histórico de Registros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progressos.filter(p => p.aluno_id === selectedAluno).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum registro de progresso encontrado para este aluno
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {progressos
                        .filter(p => p.aluno_id === selectedAluno)
                        .map((progresso) => (
                        <div key={progresso.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">
                              {new Date(progresso.data_registro).toLocaleDateString('pt-BR')}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {progresso.peso && (
                              <div>
                                <span className="text-muted-foreground">Peso:</span>
                                <p className="font-medium">{progresso.peso} kg</p>
                              </div>
                            )}
                            {progresso.percentual_gordura && (
                              <div>
                                <span className="text-muted-foreground">% Gordura:</span>
                                <p className="font-medium">{progresso.percentual_gordura}%</p>
                              </div>
                            )}
                            {progresso.massa_muscular && (
                              <div>
                                <span className="text-muted-foreground">Massa Muscular:</span>
                                <p className="font-medium">{progresso.massa_muscular} kg</p>
                              </div>
                            )}
                            {progresso.medidas && (
                              <div>
                                <span className="text-muted-foreground">Medidas:</span>
                                <div className="text-xs space-y-1">
                                  {progresso.medidas.bicep && <p>Bícep: {progresso.medidas.bicep}cm</p>}
                                  {progresso.medidas.cintura && <p>Cintura: {progresso.medidas.cintura}cm</p>}
                                  {progresso.medidas.coxa && <p>Coxa: {progresso.medidas.coxa}cm</p>}
                                </div>
                              </div>
                            )}
                          </div>
                          {progresso.observacoes && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className="text-muted-foreground text-sm">Observações:</span>
                              <p className="text-sm mt-1">{progresso.observacoes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Progresso;