-- Permitir que alunos visualizem seu próprio perfil
CREATE POLICY "Alunos podem visualizar seu próprio perfil"
ON public.alunos
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

-- Permitir que alunos atualizem seu próprio perfil
CREATE POLICY "Alunos podem atualizar seu próprio perfil"
ON public.alunos
FOR UPDATE
TO authenticated
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));