import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { TrendingUp, Sparkles, Target, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AIProgressAnalysisProps {
  progressData: any[];
  studentId?: string;
  studentName?: string;
}

const AIProgressAnalysis: React.FC<AIProgressAnalysisProps> = ({ 
  progressData,
  studentId,
  studentName
}) => {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { loading, analyzeProgress } = useAI();

  const handleAnalyze = async () => {
    const filteredData = studentId 
      ? progressData.filter(p => p.aluno_id === studentId)
      : progressData;

    if (filteredData.length === 0) {
      return;
    }

    const result = await analyzeProgress({
      student: studentName || 'Aluno',
      records: filteredData.map(p => ({
        date: p.data_registro,
        weight: p.peso,
        bodyFat: p.percentual_gordura,
        muscleMass: p.massa_muscular,
        measurements: p.medidas,
        notes: p.observacoes
      }))
    });

    if (result) {
      setAnalysis(result);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'positiva': return 'text-green-600';
      case 'negativa': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'positiva': return '📈';
      case 'negativa': return '📉';
      default: return '➡️';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={loading || progressData.length === 0}>
          <Sparkles className="h-4 w-4 mr-2" />
          Analisar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Análise de Progresso - IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!analysis ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para analisar o progresso{studentName ? ` de ${studentName}` : ''} com IA
              </p>
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Analisando...' : 'Analisar Progresso'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score e Tendência */}
              {analysis.metrics && (
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Score de Progresso</span>
                          <span className="text-2xl font-bold text-primary">
                            {analysis.metrics.score}%
                          </span>
                        </div>
                        <Progress value={analysis.metrics.score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tendência</span>
                          <Badge 
                            variant="outline" 
                            className={getTrendColor(analysis.metrics.trend)}
                          >
                            {getTrendIcon(analysis.metrics.trend)} {analysis.metrics.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Análise Detalhada */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-sm mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Análise Detalhada
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {analysis.response}
                  </p>
                </CardContent>
              </Card>

              {/* Sugestões */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-sm mb-3">Recomendações</h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Próximas Metas */}
              {analysis.metrics?.next_goals && analysis.metrics.next_goals.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-sm mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Próximas Metas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.metrics.next_goals.map((goal: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs justify-start">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botão para nova análise */}
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAnalysis(null);
                    handleAnalyze();
                  }}
                  disabled={loading}
                >
                  Gerar Nova Análise
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIProgressAnalysis;
