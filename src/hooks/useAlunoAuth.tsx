import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  objetivo?: string;
}

export const useAlunoAuth = () => {
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAlunoAuth();
  }, []);

  const checkAlunoAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: alunoData, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error || !alunoData) {
        navigate('/');
        return;
      }

      setAluno(alunoData);
    } catch (error) {
      console.error('Erro ao verificar autenticação do aluno:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  return { aluno, loading };
};
