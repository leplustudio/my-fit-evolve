import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Dumbbell, GripVertical } from 'lucide-react';

interface Exercise {
  id: string;
  nome: string;
  grupo_muscular: string;
  equipamento?: string;
  instrucoes?: string;
}

interface WorkoutExercise {
  id: string;
  exercicio_id: string;
  dia_treino: number;
  ordem: number;
  series: number;
  repeticoes: string;
  carga?: string;
  descanso_segundos: number;
  observacoes?: string;
  exercicios?: Exercise;
}

interface WorkoutExercisesProps {
  planoId: string;
  planoNome: string;
}

const WorkoutExercises: React.FC<WorkoutExercisesProps> = ({ planoId, planoNome }) => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    exercicio_id: '',
    dia_treino: '1',
    ordem: '1',
    series: '3',
    repeticoes: '10',
    carga: '',
    descanso_segundos: '60',
    observacoes: ''
  });

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('treino_exercicios')
        .select(`
          *,
          exercicios(*)
        `)
        .eq('plano_treino_id', planoId)
        .order('dia_treino')
        .order('ordem');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAvailableExercises(data || []);
    } catch (error) {
      console.error('Erro ao buscar exercícios disponíveis:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
    fetchAvailableExercises();
  }, [planoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        plano_treino_id: planoId,
        exercicio_id: formData.exercicio_id,
        dia_treino: parseInt(formData.dia_treino),
        ordem: parseInt(formData.ordem),
        series: parseInt(formData.series),
        repeticoes: formData.repeticoes,
        carga: formData.carga || null,
        descanso_segundos: parseInt(formData.descanso_segundos),
        observacoes: formData.observacoes || null
      };

      if (editingExercise) {
        const { error } = await supabase
          .from('treino_exercicios')
          .update(data)
          .eq('id', editingExercise.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Exercício atualizado!" });
      } else {
        const { error } = await supabase
          .from('treino_exercicios')
          .insert([data]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Exercício adicionado!" });
      }

      setModalOpen(false);
      setEditingExercise(null);
      setFormData({
        exercicio_id: '',
        dia_treino: '1',
        ordem: '1',
        series: '3',
        repeticoes: '10',
        carga: '',
        descanso_segundos: '60',
        observacoes: ''
      });
      fetchExercises();
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o exercício",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (exercise: WorkoutExercise) => {
    setEditingExercise(exercise);
    setFormData({
      exercicio_id: exercise.exercicio_id,
      dia_treino: exercise.dia_treino.toString(),
      ordem: exercise.ordem.toString(),
      series: exercise.series.toString(),
      repeticoes: exercise.repeticoes,
      carga: exercise.carga || '',
      descanso_segundos: exercise.descanso_segundos.toString(),
      observacoes: exercise.observacoes || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      const { error } = await supabase
        .from('treino_exercicios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Exercício removido!" });
      fetchExercises();
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o exercício",
        variant: "destructive"
      });
    }
  };

  const getDayExercises = (day: number) => {
    return exercises.filter(e => e.dia_treino === day);
  };

  const uniqueDays = [...new Set(exercises.map(e => e.dia_treino))].sort((a, b) => a - b);
  const maxDay = Math.max(...uniqueDays, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exercícios do Plano</h2>
          <p className="text-muted-foreground">{planoNome}</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Exercício
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exercicio_id">Exercício *</Label>
                  <Select
                    value={formData.exercicio_id}
                    onValueChange={(value) => setFormData({...formData, exercicio_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um exercício" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.nome} ({ex.grupo_muscular})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dia_treino">Dia do Treino *</Label>
                  <Input
                    id="dia_treino"
                    type="number"
                    min="1"
                    value={formData.dia_treino}
                    onChange={(e) => setFormData({...formData, dia_treino: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ordem">Ordem *</Label>
                  <Input
                    id="ordem"
                    type="number"
                    min="1"
                    value={formData.ordem}
                    onChange={(e) => setFormData({...formData, ordem: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="series">Séries *</Label>
                  <Input
                    id="series"
                    type="number"
                    min="1"
                    value={formData.series}
                    onChange={(e) => setFormData({...formData, series: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="repeticoes">Repetições *</Label>
                  <Input
                    id="repeticoes"
                    placeholder="8-12"
                    value={formData.repeticoes}
                    onChange={(e) => setFormData({...formData, repeticoes: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="carga">Carga</Label>
                  <Input
                    id="carga"
                    placeholder="Ex: 20kg"
                    value={formData.carga}
                    onChange={(e) => setFormData({...formData, carga: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descanso_segundos">Descanso (segundos) *</Label>
                <Input
                  id="descanso_segundos"
                  type="number"
                  min="0"
                  value={formData.descanso_segundos}
                  onChange={(e) => setFormData({...formData, descanso_segundos: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingExercise ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs para dias de treino */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Array.from({ length: Math.max(maxDay, 1) }, (_, i) => i + 1).map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            className="min-w-[100px]"
          >
            Dia {day}
          </Button>
        ))}
      </div>

      {/* Lista de exercícios do dia selecionado */}
      <div className="space-y-4">
        {getDayExercises(selectedDay).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum exercício cadastrado para o Dia {selectedDay}
              </p>
            </CardContent>
          </Card>
        ) : (
          getDayExercises(selectedDay).map((exercise, index) => (
            <Card key={exercise.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    <GripVertical className="h-3 w-3 mr-1" />
                    {exercise.ordem}
                  </Badge>
                  <CardTitle className="text-lg">
                    {exercise.exercicios?.nome}
                  </CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(exercise)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Grupo Muscular</p>
                    <p className="font-medium">{exercise.exercicios?.grupo_muscular}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Séries x Repetições</p>
                    <p className="font-medium">{exercise.series} x {exercise.repeticoes}</p>
                  </div>
                  {exercise.carga && (
                    <div>
                      <p className="text-xs text-muted-foreground">Carga</p>
                      <p className="font-medium">{exercise.carga}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Descanso</p>
                    <p className="font-medium">{exercise.descanso_segundos}s</p>
                  </div>
                </div>
                {exercise.observacoes && (
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Obs:</strong> {exercise.observacoes}
                  </p>
                )}
                {exercise.exercicios?.instrucoes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Instruções:</strong> {exercise.exercicios.instrucoes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutExercises;
