import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';

interface AIAssistantProps {
  context?: string;
  studentData?: any;
  triggerText?: string;
  variant?: "default" | "outline" | "ghost";
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  context = "general", 
  studentData, 
  triggerText = "Consultar IA",
  variant = "default"
}) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { loading, getGeneralAdvice } = useAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const result = await getGeneralAdvice(question, {
      context,
      studentData
    });

    if (result) {
      setResponse(result.response);
      setSuggestions(result.suggestions || []);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setResponse(null);
    setSuggestions([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} disabled={loading}>
          <Bot className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Assistente IA - EvolveFit
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                Faça sua pergunta:
              </label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Como melhorar a hipertrofia muscular? Quais exercícios são melhores para iniciantes?"
                rows={3}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading || !question.trim()}>
                {loading ? 'Consultando...' : 'Consultar IA'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Limpar
              </Button>
            </div>
          </form>

          {response && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-primary">Resposta da IA:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {response}
                    </p>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Sugestões:</h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;