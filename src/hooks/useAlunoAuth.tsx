import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
        toast.error('Você precisa fazer login primeiro');
        navigate('/auth');
        return;
      }

      const { data: alunoData, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error || !alunoData) {
        toast.error('Acesso negado', {
          description: 'Você precisa ser cadastrado como aluno pelo seu personal trainer. Entre em contato com seu personal para criar seu cadastro.'
        });
        await supabase.auth.signOut();
        navigate('/auth');
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
