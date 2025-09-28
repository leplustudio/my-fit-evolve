import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { Sparkles, Target, Calendar, TrendingUp } from 'lucide-react';

interface AIWorkoutGeneratorProps {
  student: any;
  onWorkoutGenerated: (workout: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIWorkoutGenerator: React.FC<AIWorkoutGeneratorProps> = ({
  student,
  onWorkoutGenerated,
  open,
  onOpenChange
}) => {
  const [preferences, setPreferences] = useState({
    goal: '',
    duration: '4',
    frequency: '3',
    level: 'iniciante'
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const { loading, generateWorkoutPlan } = useAI();

  const handleGenerate = async () => {
    const result = await generateWorkoutPlan(student, preferences);
    
    if (result) {
      // Parse da resposta da IA para extrair dados estruturados
      const workout = {
        nome: `Treino IA - ${student.nome}`,
        descricao: result.response,
        duracao_semanas: parseInt(preferences.duration),
        dias_semana: parseInt(preferences.frequency),
        nivel: preferences.level,
        aluno_id: student.id
      };
      
      setGeneratedPlan({
        ...workout,
        suggestions: result.suggestions || []
      });
    }
  };

  const handleUse = () => {
    if (generatedPlan) {
      onWorkoutGenerated(generatedPlan);
      onOpenChange(false);
      setGeneratedPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Gerar Treino com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Aluno */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Aluno Selecionado:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Nome:</strong> {student?.nome}</p>
                {student?.objetivo && <p><strong>Objetivo:</strong> {student.objetivo}</p>}
                {student?.altura && student?.peso && (
                  <p><strong>Físico:</strong> {student.altura}m, {student.peso}kg</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferências do Treino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Target className="h-4 w-4 inline mr-1" />
                Foco Principal:
              </label>
              <Select value={preferences.goal} onValueChange={(value) => 
                setPreferences({...preferences, goal: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="resistencia">Resistência</SelectItem>
                  <SelectItem value="forca">Força</SelectItem>
                  <SelectItem value="reabilitacao">Reabilitação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Nível:
              </label>
              <Select value={preferences.level} onValueChange={(value) =>
                setPreferences({...preferences, level: value})
              }>
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Duração (semanas):
              </label>
              <Select value={preferences.duration} onValueChange={(value) =>
                setPreferences({...preferences, duration: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 semanas</SelectItem>
                  <SelectItem value="4">4 semanas</SelectItem>
                  <SelectItem value="6">6 semanas</SelectItem>
                  <SelectItem value="8">8 semanas</SelectItem>
                  <SelectItem value="12">12 semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frequência semanal:</label>
              <Select value={preferences.frequency} onValueChange={(value) =>
                setPreferences({...preferences, frequency: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x por semana</SelectItem>
                  <SelectItem value="3">3x por semana</SelectItem>
                  <SelectItem value="4">4x por semana</SelectItem>
                  <SelectItem value="5">5x por semana</SelectItem>
                  <SelectItem value="6">6x por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão Gerar */}
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !preferences.goal}
            className="w-full"
          >
            {loading ? 'Gerando treino...' : 'Gerar Treino com IA'}
          </Button>

          {/* Resultado */}
          {generatedPlan && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Plano Gerado:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {generatedPlan.descricao}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {generatedPlan.duracao_semanas} semanas
                    </Badge>
                    <Badge variant="outline">
                      {generatedPlan.dias_semana}x por semana
                    </Badge>
                    <Badge variant="outline">
                      {generatedPlan.nivel}
                    </Badge>
                  </div>

                  {generatedPlan.suggestions?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Sugestões Adicionais:</h5>
                      <div className="flex flex-wrap gap-2">
                        {generatedPlan.suggestions.map((suggestion: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button onClick={handleUse} size="sm">
                      Usar este Plano
                    </Button>
                    <Button onClick={() => setGeneratedPlan(null)} variant="outline" size="sm">
                      Gerar Novo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIWorkoutGenerator;