import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para auth se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // O useEffect vai redirecionar
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={user.user_metadata?.nome || user.email || ''} 
        profileLink="/perfil" 
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Bem-vindo ao EvolveFit
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Sua plataforma completa para gestão de alunos e treinos personalizados
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Card Alunos */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Gerenciar Alunos</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre e acompanhe todos os seus alunos em um só lugar
              </p>
              <Link to="/alunos">
                <Button className="w-full">
                  Ver Alunos
                </Button>
              </Link>
            </div>

            {/* Card Treinos */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary text-4xl mb-4">💪</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Planos de Treino</h3>
              <p className="text-muted-foreground mb-4">
                Gere treinos personalizados com IA para cada aluno
              </p>
              <Link to="/treinos">
                <Button className="w-full">
                  Criar Treino
                </Button>
              </Link>
            </div>

            {/* Card Progresso */}
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-primary text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Acompanhar Progresso</h3>
              <p className="text-muted-foreground mb-4">
                Visualize a evolução dos seus alunos com gráficos
              </p>
              <Link to="/progresso">
                <Button className="w-full">
                  Ver Progresso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
