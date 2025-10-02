import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlunoAuth } from '@/hooks/useAlunoAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

const alunoProfileSchema = z.object({
  nome: z.string().trim().min(1, { message: "Nome é obrigatório" }).max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().trim().optional().refine(
    (val) => !val || /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(val),
    { message: "Formato de telefone inválido. Use (XX) XXXXX-XXXX" }
  ),
  data_nascimento: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: "Data inválida" }
  ),
  peso: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: "Peso deve ser um número positivo" }
  ),
  altura: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    { message: "Altura deve ser um número positivo" }
  ),
  objetivo: z.string().max(500, { message: "Objetivo deve ter no máximo 500 caracteres" }).optional(),
});

type AlunoProfileFormData = z.infer<typeof alunoProfileSchema>;

const PerfilAluno = () => {
  const { aluno, loading: authLoading } = useAlunoAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AlunoProfileFormData>({
    resolver: zodResolver(alunoProfileSchema),
  });

  useEffect(() => {
    if (!authLoading && !aluno) {
      navigate('/auth');
      return;
    }

    if (aluno) {
      setValue('nome', aluno.nome);
      setValue('email', aluno.email);
      setValue('telefone', aluno.telefone || '');
      setValue('data_nascimento', aluno.data_nascimento || '');
      setValue('peso', aluno.peso?.toString() || '');
      setValue('altura', aluno.altura?.toString() || '');
      setValue('objetivo', aluno.objetivo || '');
    }
  }, [aluno, authLoading]);

  const onSubmit = async (data: AlunoProfileFormData) => {
    setSaving(true);
    try {
      const updateData: any = {
        nome: data.nome,
        telefone: data.telefone || null,
        data_nascimento: data.data_nascimento || null,
        peso: data.peso ? Number(data.peso) : null,
        altura: data.altura ? Number(data.altura) : null,
        objetivo: data.objetivo || null,
      };

      const { error } = await supabase
        .from('alunos')
        .update(updateData)
        .eq('id', aluno?.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName={aluno?.nome || ''} profileLink="/aluno/perfil" />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/aluno/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email')}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(11) 98765-4321"
                />
                {errors.telefone && (
                  <p className="text-sm text-destructive">{errors.telefone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    {...register('data_nascimento')}
                  />
                  {errors.data_nascimento && (
                    <p className="text-sm text-destructive">{errors.data_nascimento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    {...register('peso')}
                    placeholder="70.5"
                  />
                  {errors.peso && (
                    <p className="text-sm text-destructive">{errors.peso.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (m)</Label>
                  <Input
                    id="altura"
                    type="number"
                    step="0.01"
                    {...register('altura')}
                    placeholder="1.75"
                  />
                  {errors.altura && (
                    <p className="text-sm text-destructive">{errors.altura.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Textarea
                  id="objetivo"
                  {...register('objetivo')}
                  placeholder="Descreva seus objetivos fitness..."
                  rows={4}
                />
                {errors.objetivo && (
                  <p className="text-sm text-destructive">{errors.objetivo.message}</p>
                )}
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PerfilAluno;
