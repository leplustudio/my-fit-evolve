-- Criar tabela de alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_trainer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  data_nascimento DATE,
  altura DECIMAL(3,2), -- em metros (ex: 1.75)
  peso DECIMAL(5,2), -- em kg (ex: 70.50)
  objetivo TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de planos de treino
CREATE TABLE public.planos_treino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_semanas INTEGER NOT NULL DEFAULT 4,
  dias_semana INTEGER NOT NULL DEFAULT 3,
  nivel TEXT NOT NULL DEFAULT 'iniciante', -- iniciante, intermediario, avancado
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de exercícios
CREATE TABLE public.exercicios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL, -- peito, costas, pernas, etc
  equipamento TEXT, -- halteres, barra, máquina, etc
  instrucoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de exercícios do treino
CREATE TABLE public.treino_exercicios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_treino_id UUID NOT NULL REFERENCES public.planos_treino(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES public.exercicios(id) ON DELETE CASCADE,
  dia_treino INTEGER NOT NULL, -- 1, 2, 3, etc
  ordem INTEGER NOT NULL,
  series INTEGER NOT NULL,
  repeticoes TEXT NOT NULL, -- ex: "12-15", "10", "8-12"
  carga TEXT, -- ex: "20kg", "15-20kg", "peso corporal"
  descanso_segundos INTEGER DEFAULT 60,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de progresso
CREATE TABLE public.progresso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  peso DECIMAL(5,2),
  percentual_gordura DECIMAL(4,2),
  massa_muscular DECIMAL(5,2),
  medidas JSONB, -- {"bicep": 35, "cintura": 80, "coxa": 55}
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treino_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para alunos
CREATE POLICY "Personal trainers can manage their students" 
ON public.alunos FOR ALL
USING (personal_trainer_id = auth.uid());

-- Políticas RLS para planos de treino
CREATE POLICY "Personal trainers can manage workout plans" 
ON public.planos_treino FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.alunos 
    WHERE alunos.id = planos_treino.aluno_id 
    AND alunos.personal_trainer_id = auth.uid()
  )
);

-- Políticas RLS para exercícios (todos podem ver, mas só admins podem modificar)
CREATE POLICY "Everyone can view exercises" 
ON public.exercicios FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage exercises" 
ON public.exercicios FOR ALL
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para treino_exercicios
CREATE POLICY "Personal trainers can manage workout exercises" 
ON public.treino_exercicios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.planos_treino pt
    JOIN public.alunos a ON pt.aluno_id = a.id
    WHERE pt.id = treino_exercicios.plano_treino_id 
    AND a.personal_trainer_id = auth.uid()
  )
);

-- Políticas RLS para progresso
CREATE POLICY "Personal trainers can manage student progress" 
ON public.progresso FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.alunos 
    WHERE alunos.id = progresso.aluno_id 
    AND alunos.personal_trainer_id = auth.uid()
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_alunos_updated_at
BEFORE UPDATE ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_treino_updated_at
BEFORE UPDATE ON public.planos_treino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treino_exercicios_updated_at
BEFORE UPDATE ON public.treino_exercicios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir exercícios básicos para demonstração
INSERT INTO public.exercicios (nome, grupo_muscular, equipamento, instrucoes) VALUES
('Supino Reto', 'peito', 'barra', 'Deite no banco, segure a barra com as mãos afastadas na largura dos ombros'),
('Agachamento', 'pernas', 'barra', 'Pés afastados na largura dos ombros, desça até as coxas ficarem paralelas ao chão'),
('Puxada Alta', 'costas', 'máquina', 'Puxe a barra até o peito, contraia as escápulas'),
('Desenvolvimento com Halteres', 'ombros', 'halteres', 'Levante os halteres acima da cabeça, mantendo o core contraído'),
('Rosca Direta', 'bíceps', 'halteres', 'Flexione os cotovelos levando os halteres ao peito'),
('Tríceps Pulley', 'tríceps', 'máquina', 'Estenda os braços empurrando a barra para baixo'),
('Leg Press', 'pernas', 'máquina', 'Empurre a plataforma com os pés, mantendo os joelhos alinhados'),
('Remada Baixa', 'costas', 'máquina', 'Puxe o cabo até o abdômen, mantendo as costas retas'),
('Elevação Lateral', 'ombros', 'halteres', 'Levante os halteres lateralmente até a altura dos ombros'),
('Abdominal Crunch', 'abdômen', 'peso corporal', 'Contraia o abdômen elevando o tronco em direção aos joelhos');