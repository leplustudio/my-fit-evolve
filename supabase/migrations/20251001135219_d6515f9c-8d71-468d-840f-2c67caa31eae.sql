-- Criar tabela para registrar execuções de treinos
CREATE TABLE public.treino_execucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  treino_exercicio_id UUID NOT NULL REFERENCES public.treino_exercicios(id) ON DELETE CASCADE,
  data_execucao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  series_realizadas JSONB NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.treino_execucoes ENABLE ROW LEVEL SECURITY;

-- Política para alunos visualizarem seus próprios registros
CREATE POLICY "Alunos podem visualizar suas execuções"
ON public.treino_execucoes
FOR SELECT
USING (
  aluno_id IN (
    SELECT id FROM public.alunos WHERE email = auth.jwt()->>'email'
  )
);

-- Política para alunos registrarem suas próprias execuções
CREATE POLICY "Alunos podem registrar suas execuções"
ON public.treino_execucoes
FOR INSERT
WITH CHECK (
  aluno_id IN (
    SELECT id FROM public.alunos WHERE email = auth.jwt()->>'email'
  )
);

-- Política para personal trainers visualizarem execuções de seus alunos
CREATE POLICY "Personal trainers podem visualizar execuções de seus alunos"
ON public.treino_execucoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.alunos
    WHERE alunos.id = treino_execucoes.aluno_id
    AND alunos.personal_trainer_id = auth.uid()
  )
);

-- Índices para melhor performance
CREATE INDEX idx_treino_execucoes_aluno_id ON public.treino_execucoes(aluno_id);
CREATE INDEX idx_treino_execucoes_data ON public.treino_execucoes(data_execucao);
CREATE INDEX idx_treino_execucoes_exercicio ON public.treino_execucoes(treino_exercicio_id);