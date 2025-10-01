import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Alunos from "./pages/Alunos";
import Treinos from "./pages/Treinos";
import Progresso from "./pages/Progresso";
import AlunoDashboard from "./pages/AlunoDashboard";
import AlunoTreinos from "./pages/AlunoTreinos";
import AlunoTreinoDetalhes from "./pages/AlunoTreinoDetalhes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/alunos" element={<Alunos />} />
              <Route path="/treinos" element={<Treinos />} />
              <Route path="/progresso" element={<Progresso />} />
              <Route path="/aluno/dashboard" element={<AlunoDashboard />} />
              <Route path="/aluno/treinos" element={<AlunoTreinos />} />
              <Route path="/aluno/treino/:id" element={<AlunoTreinoDetalhes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
