import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlunoAuth } from '@/hooks/useAlunoAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Dumbbell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Exercicio {
  id: string;
  exercicio_id: string;
  exercicio: {
    nome: string;
    grupo_muscular: string;
  };
  series: number;
  repeticoes: string;
  carga?: string;
  descanso_segundos?: number;
  observacoes?: string;
  dia_treino: number;
  ordem: number;
}

interface SerieRegistro {
  serie: number;
  repeticoes: number;
  carga: string;
}

export default function AlunoTreinoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { aluno, loading } = useAlunoAuth();
  const navigate = useNavigate();
  const [planoTreino, setPlanoTreino] = useState<any>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [registros, setRegistros] = useState<{ [key: string]: { series: SerieRegistro[], observacoes: string } }>({});

  useEffect(() => {
    if (aluno && id) {
      fetchTreinoDetails();
    }
  }, [aluno, id]);

  const fetchTreinoDetails = async () => {
    if (!aluno || !id) return;

    try {
      const { data: plano, error: planoError } = await supabase
        .from('planos_treino')
        .select('*')
        .eq('id', id)
        .eq('aluno_id', aluno.id)
        .single();

      if (planoError) throw planoError;
      setPlanoTreino(plano);

      const { data: exerciciosData, error: exerciciosError } = await supabase
        .from('treino_exercicios')
        .select(`
          *,
          exercicio:exercicios(nome, grupo_muscular)
        `)
        .eq('plano_treino_id', id)
        .order('dia_treino', { ascending: true })
        .order('ordem', { ascending: true });

      if (exerciciosError) throw exerciciosError;
      setExercicios(exerciciosData || []);

      // Initialize registros
      const initialRegistros: any = {};
      exerciciosData?.forEach(ex => {
        initialRegistros[ex.id] = {
          series: Array.from({ length: ex.series }, (_, i) => ({
            serie: i + 1,
            repeticoes: 0,
            carga: ex.carga || '',
          })),
          observacoes: '',
        };
      });
      setRegistros(initialRegistros);
    } catch (error) {
      console.error('Erro ao buscar detalhes do treino:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do treino',
        variant: 'destructive',
      });
    }
  };

  const handleSerieChange = (exercicioId: string, serieIndex: number, field: 'repeticoes' | 'carga', value: string | number) => {
    setRegistros(prev => ({
      ...prev,
      [exercicioId]: {
        ...prev[exercicioId],
        series: prev[exercicioId].series.map((s, i) => 
          i === serieIndex ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  const handleSaveExercicio = async (exercicioId: string) => {
    if (!aluno) return;

    try {
      const { error } = await supabase
        .from('treino_execucoes')
        .insert([{
          aluno_id: aluno.id,
          treino_exercicio_id: exercicioId,
          series_realizadas: registros[exercicioId].series as any,
          observacoes: registros[exercicioId].observacoes,
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Exercício registrado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o exercício',
        variant: 'destructive',
      });
    }
  };

  const diasUnicos = [...new Set(exercicios.map(e => e.dia_treino))].sort();
  const exerciciosDoDia = exercicios.filter(e => e.dia_treino === selectedDay);

  if (loading || !planoTreino) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/aluno/treinos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{planoTreino.nome}</h1>
          <p className="text-muted-foreground">{planoTreino.descricao}</p>
        </div>
      </div>

      <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
        <TabsList>
          {diasUnicos.map(dia => (
            <TabsTrigger key={dia} value={dia.toString()}>
              Dia {dia}
            </TabsTrigger>
          ))}
        </TabsList>

        {diasUnicos.map(dia => (
          <TabsContent key={dia} value={dia.toString()} className="space-y-4">
            {exercicios.filter(e => e.dia_treino === dia).map((exercicio) => (
              <Card key={exercicio.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exercicio.exercicio.nome}</CardTitle>
                    <Badge variant="outline">{exercicio.exercicio.grupo_muscular}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {exercicio.series}x {exercicio.repeticoes} repetições
                    {exercicio.descanso_segundos && ` • ${exercicio.descanso_segundos}s descanso`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {registros[exercicio.id]?.series.map((serie, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">Série {serie.serie}:</span>
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={serie.repeticoes || ''}
                          onChange={(e) => handleSerieChange(exercicio.id, index, 'repeticoes', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Input
                          type="text"
                          placeholder="Carga"
                          value={serie.carga}
                          onChange={(e) => handleSerieChange(exercicio.id, index, 'carga', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    ))}
                  </div>

                  {exercicio.observacoes && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm"><strong>Observações:</strong> {exercicio.observacoes}</p>
                    </div>
                  )}

                  <Textarea
                    placeholder="Adicione observações sobre sua execução..."
                    value={registros[exercicio.id]?.observacoes || ''}
                    onChange={(e) => setRegistros(prev => ({
                      ...prev,
                      [exercicio.id]: {
                        ...prev[exercicio.id],
                        observacoes: e.target.value,
                      },
                    }))}
                  />

                  <Button onClick={() => handleSaveExercicio(exercicio.id)} className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Registrar Exercício
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
