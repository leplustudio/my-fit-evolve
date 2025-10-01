import { useState, useEffect } from 'react';
import { useAlunoAuth } from '@/hooks/useAlunoAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AlunoDashboard() {
  const { aluno, loading } = useAlunoAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (aluno) {
      fetchProgressData();
      fetchWorkoutStats();
    }
  }, [aluno]);

  const fetchProgressData = async () => {
    if (!aluno) return;

    const { data, error } = await supabase
      .from('progresso')
      .select('*')
      .eq('aluno_id', aluno.id)
      .order('data_registro', { ascending: true });

    if (error) {
      console.error('Erro ao buscar progresso:', error);
      return;
    }

    const formattedData = data.map(item => ({
      data: new Date(item.data_registro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: item.peso,
      gordura: item.percentual_gordura,
      musculo: item.massa_muscular,
    }));

    setProgressData(formattedData);
  };

  const fetchWorkoutStats = async () => {
    if (!aluno) return;

    const { data, error } = await supabase
      .from('treino_execucoes')
      .select('data_execucao')
      .eq('aluno_id', aluno.id);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    setWorkoutStats({
      totalWorkouts: data.length,
      thisWeek: data.filter(d => new Date(d.data_execucao) >= weekAgo).length,
      thisMonth: data.filter(d => new Date(d.data_execucao) >= monthAgo).length,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Olá, {aluno?.nome}!</p>
        </div>
        <Button onClick={() => navigate('/aluno/treinos')}>
          <Dumbbell className="h-4 w-4 mr-2" />
          Meus Treinos
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">Treinos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutStats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {progressData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ peso: { label: "Peso (kg)", color: "hsl(var(--primary))" } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composição Corporal</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer 
                config={{ 
                  gordura: { label: "% Gordura", color: "hsl(var(--destructive))" },
                  musculo: { label: "Massa Muscular (kg)", color: "hsl(var(--primary))" }
                }} 
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="gordura" stroke="hsl(var(--destructive))" strokeWidth={2} name="% Gordura" />
                    <Line type="monotone" dataKey="musculo" stroke="hsl(var(--primary))" strokeWidth={2} name="Massa Muscular" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}

      {progressData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum dado de progresso registrado ainda.<br />
              Seu personal trainer irá adicionar suas medições.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
