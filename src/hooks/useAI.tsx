import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  response: string;
  suggestions?: string[];
  exercises?: Array<{
    name: string;
    muscle_group?: string;
    equipment?: string;
    sets?: number;
    reps?: string;
    rest?: number;
    instructions?: string;
    day?: number;
    order?: number;
  }>;
  metrics?: {
    trend: string;
    score: number;
    next_goals: string[];
  };
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const generateWorkoutPlan = async (studentData: any, preferences: any): Promise<AIResponse | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: { 
          student: studentData, 
          preferences: preferences 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível gerar o treino. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeProgress = async (progressData: any): Promise<AIResponse | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-progress', {
        body: { progress: progressData }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao analisar progresso:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível analisar o progresso. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGeneralAdvice = async (question: string, context?: any): Promise<AIResponse | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('general-advice', {
        body: { question, context }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao consultar IA:', error);
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

  return {
    loading,
    generateWorkoutPlan,
    analyzeProgress,
    getGeneralAdvice
  };
};