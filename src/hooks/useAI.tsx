import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface AIRequest {
  context: string;
  question: string;
  userData?: any;
}

interface AIResponse {
  response: string;
  suggestions?: string[];
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const callAI = async (request: AIRequest): Promise<AIResponse | null> => {
    setLoading(true);
    
    try {
      const response = await fetch('https://n8n.leplustudio.top/webhook-test/evolvefit-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: request.context,
          question: request.question,
          userData: request.userData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao chamar IA:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível consultar a inteligência artificial. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async (studentData: any, preferences: any) => {
    return callAI({
      context: "workout_generation",
      question: "Gere um plano de treino personalizado baseado nos dados do aluno",
      userData: {
        student: studentData,
        preferences: preferences,
        action: "generate_workout"
      }
    });
  };

  const analyzeProgress = async (progressData: any) => {
    return callAI({
      context: "progress_analysis",
      question: "Analise o progresso do aluno e forneça sugestões de melhoria",
      userData: {
        progress: progressData,
        action: "analyze_progress"
      }
    });
  };

  const getGeneralAdvice = async (question: string, context?: any) => {
    return callAI({
      context: "general_consultation",
      question: question,
      userData: {
        context: context,
        action: "general_advice"
      }
    });
  };

  return {
    loading,
    callAI,
    generateWorkoutPlan,
    analyzeProgress,
    getGeneralAdvice
  };
};