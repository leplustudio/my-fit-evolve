import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dumbbell, Calendar, Eye } from 'lucide-react';

interface PlanoTreino {
  id: string;
  nome: string;
  descricao?: string;
  duracao_semanas: number;
  dias_semana: number;
  nivel: string;
  ativo: boolean;
}

interface StudentWorkoutsProps {
  alunoId: string;
  alunoNome: string;
}

const StudentWorkouts: React.FC<StudentWorkoutsProps> = ({ alunoId, alunoNome }) => {
  const [workouts, setWorkouts] = useState<PlanoTreino[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_treino')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os treinos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [alunoId]);

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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum treino criado ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center">
        <Dumbbell className="h-4 w-4 mr-2" />
        Treinos de {alunoNome}
      </h4>
      {workouts.map((workout) => (
        <Card key={workout.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{workout.nome}</span>
              <Badge className={getNivelColor(workout.nivel)} variant="secondary">
                {workout.nivel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {workout.descricao && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {workout.descricao}
              </p>
            )}
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {workout.duracao_semanas} semanas
              </Badge>
              <Badge variant="outline" className="text-xs">
                {workout.dias_semana}x/semana
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentWorkouts;
