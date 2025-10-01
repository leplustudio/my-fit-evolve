import { useState, useEffect } from 'react';
import { useAlunoAuth } from '@/hooks/useAlunoAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlanoTreino {
  id: string;
  nome: string;
  descricao?: string;
  duracao_semanas: number;
  dias_semana: number;
  nivel: string;
  ativo: boolean;
}

export default function AlunoTreinos() {
  const { aluno, loading } = useAlunoAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<PlanoTreino[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  useEffect(() => {
    if (aluno) {
      fetchWorkouts();
    }
  }, [aluno]);

  const fetchWorkouts = async () => {
    if (!aluno) return;

    try {
      const { data, error } = await supabase
        .from('planos_treino')
        .select('*')
        .eq('aluno_id', aluno.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
    } finally {
      setLoadingWorkouts(false);
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

  if (loading || loadingWorkouts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/aluno/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Meus Treinos</h1>
          <p className="text-muted-foreground">Selecione um treino para registrar sua execução</p>
        </div>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum treino disponível.<br />
              Seu personal trainer criará treinos para você em breve.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/aluno/treino/${workout.id}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{workout.nome}</CardTitle>
                  <Badge className={getNivelColor(workout.nivel)} variant="secondary">
                    {workout.nivel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {workout.descricao && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {workout.descricao}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {workout.duracao_semanas} semanas
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {workout.dias_semana}x/semana
                  </Badge>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
