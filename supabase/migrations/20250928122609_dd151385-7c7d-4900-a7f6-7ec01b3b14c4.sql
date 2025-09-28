-- Primeiro, vamos pegar o user_id do usuário atual (você pode substituir pelo ID real do seu usuário)
-- Para fins de teste, vamos inserir dados fictícios usando uma função

DO $$
DECLARE
    trainer_user_id UUID;
    aluno1_id UUID;
    aluno2_id UUID;
    aluno3_id UUID;
    plano1_id UUID;
    plano2_id UUID;
    exercicio_supino_id UUID;
    exercicio_agachamento_id UUID;
    exercicio_puxada_id UUID;
BEGIN
    -- Buscar o primeiro user_id da tabela profiles para usar como personal trainer
    SELECT user_id INTO trainer_user_id FROM public.profiles LIMIT 1;
    
    -- Se não encontrar nenhum profile, não fazer nada
    IF trainer_user_id IS NULL THEN
        RAISE NOTICE 'Nenhum perfil encontrado. Execute este script após fazer login no sistema.';
        RETURN;
    END IF;

    -- Inserir alunos fictícios
    INSERT INTO public.alunos (personal_trainer_id, nome, email, telefone, data_nascimento, altura, peso, objetivo, observacoes)
    VALUES 
    (trainer_user_id, 'João Silva', 'joao.silva@email.com', '(11) 99999-1234', '1990-05-15', 1.75, 75.5, 'Ganho de massa muscular', 'Iniciante em musculação')
    RETURNING id INTO aluno1_id;

    INSERT INTO public.alunos (personal_trainer_id, nome, email, telefone, data_nascimento, altura, peso, objetivo, observacoes)
    VALUES 
    (trainer_user_id, 'Maria Santos', 'maria.santos@email.com', '(11) 99999-5678', '1988-08-22', 1.65, 68.0, 'Perda de peso e tonificação', 'Pratica corrida regularmente')
    RETURNING id INTO aluno2_id;

    INSERT INTO public.alunos (personal_trainer_id, nome, email, telefone, data_nascimento, altura, peso, objetivo, observacoes)
    VALUES 
    (trainer_user_id, 'Carlos Oliveira', 'carlos.oliveira@email.com', '(11) 99999-9012', '1985-12-03', 1.80, 82.3, 'Melhora do condicionamento físico', 'Ex-atleta retornando aos treinos')
    RETURNING id INTO aluno3_id;

    -- Inserir planos de treino
    INSERT INTO public.planos_treino (aluno_id, nome, descricao, duracao_semanas, dias_semana, nivel)
    VALUES 
    (aluno1_id, 'Hipertrofia Iniciante', 'Programa focado em ganho de massa muscular para iniciantes', 8, 3, 'iniciante')
    RETURNING id INTO plano1_id;

    INSERT INTO public.planos_treino (aluno_id, nome, descricao, duracao_semanas, dias_semana, nivel)
    VALUES 
    (aluno2_id, 'Emagrecimento e Tonificação', 'Combinação de exercícios para queima de gordura e tonificação muscular', 6, 4, 'intermediario')
    RETURNING id INTO plano2_id;

    -- Buscar IDs dos exercícios
    SELECT id INTO exercicio_supino_id FROM public.exercicios WHERE nome = 'Supino Reto' LIMIT 1;
    SELECT id INTO exercicio_agachamento_id FROM public.exercicios WHERE nome = 'Agachamento' LIMIT 1;
    SELECT id INTO exercicio_puxada_id FROM public.exercicios WHERE nome = 'Puxada Alta' LIMIT 1;

    -- Inserir exercícios nos treinos
    INSERT INTO public.treino_exercicios (plano_treino_id, exercicio_id, dia_treino, ordem, series, repeticoes, carga, descanso_segundos, observacoes)
    VALUES 
    (plano1_id, exercicio_supino_id, 1, 1, 3, '8-12', '40kg', 90, 'Foque na execução correta'),
    (plano1_id, exercicio_agachamento_id, 1, 2, 3, '12-15', '30kg', 90, 'Desça até as coxas ficarem paralelas'),
    (plano1_id, exercicio_puxada_id, 1, 3, 3, '10-12', '35kg', 60, 'Contraia bem as escápulas'),
    
    (plano2_id, exercicio_agachamento_id, 1, 1, 4, '15-20', '25kg', 60, 'Movimento explosivo na subida'),
    (plano2_id, exercicio_puxada_id, 1, 2, 3, '12-15', '30kg', 45, 'Ritmo mais acelerado');

    -- Inserir registros de progresso
    INSERT INTO public.progresso (aluno_id, data_registro, peso, percentual_gordura, massa_muscular, medidas, observacoes)
    VALUES 
    (aluno1_id, CURRENT_DATE - INTERVAL '30 days', 75.5, 18.5, 35.2, '{"bicep": 32, "cintura": 85, "coxa": 52}', 'Medidas iniciais'),
    (aluno1_id, CURRENT_DATE - INTERVAL '15 days', 76.2, 17.8, 36.1, '{"bicep": 33, "cintura": 84, "coxa": 53}', 'Bom progresso no ganho de massa'),
    (aluno1_id, CURRENT_DATE, 77.0, 17.2, 37.0, '{"bicep": 34, "cintura": 83, "coxa": 54}', 'Continuando a evolução'),
    
    (aluno2_id, CURRENT_DATE - INTERVAL '25 days', 68.0, 22.3, 28.5, '{"bicep": 28, "cintura": 75, "coxa": 48}', 'Início do programa'),
    (aluno2_id, CURRENT_DATE - INTERVAL '10 days', 66.8, 21.1, 29.2, '{"bicep": 29, "cintura": 73, "coxa": 49}', 'Perdendo gordura e ganhando músculo'),
    (aluno2_id, CURRENT_DATE, 65.5, 19.8, 29.8, '{"bicep": 29, "cintura": 71, "coxa": 50}', 'Excelente progresso na composição corporal');

    RAISE NOTICE 'Dados fictícios inseridos com sucesso!';
    RAISE NOTICE 'Alunos criados: João Silva, Maria Santos, Carlos Oliveira';
    RAISE NOTICE 'Planos de treino e registros de progresso também foram adicionados';
    
END $$;