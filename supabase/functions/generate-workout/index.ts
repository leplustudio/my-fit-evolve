import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student, preferences } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('Gerando treino para:', student.nome, 'com preferências:', preferences);

    const prompt = `Você é um personal trainer especializado. Crie um plano de treino detalhado para:

ALUNO:
- Nome: ${student.nome}
- Objetivo: ${student.objetivo || preferences.goal}
- Altura: ${student.altura || 'não informado'}m
- Peso: ${student.peso || 'não informado'}kg
- Nível: ${preferences.level}

PARÂMETROS DO TREINO:
- Foco: ${preferences.goal}
- Duração: ${preferences.duration} semanas
- Frequência: ${preferences.frequency}x por semana
- Nível: ${preferences.level}

Retorne um JSON com o seguinte formato:
{
  "response": "Descrição geral do plano de treino (2-3 parágrafos)",
  "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
  "exercises": [
    {
      "name": "Nome do exercício",
      "muscle_group": "Grupo muscular",
      "equipment": "Equipamento necessário",
      "sets": 3,
      "reps": "10-12",
      "rest": 60,
      "instructions": "Como executar",
      "day": 1,
      "order": 1
    }
  ]
}

IMPORTANTE:
- Inclua pelo menos ${preferences.frequency * 4} exercícios distribuídos nos dias
- Varie os exercícios por grupo muscular
- Adapte a intensidade ao nível do aluno`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um personal trainer especializado em criar planos de treino personalizados. Sempre retorne respostas em JSON válido.'
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro OpenAI:', response.status, errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta OpenAI:', JSON.stringify(data));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Resposta inválida da OpenAI:', data);
      throw new Error('Resposta inválida da API OpenAI');
    }

    const content = data.choices[0].message.content;
    if (!content) {
      console.error('Conteúdo vazio da OpenAI');
      throw new Error('API OpenAI retornou conteúdo vazio');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      console.error('Conteúdo recebido:', content);
      throw new Error('Erro ao processar resposta da IA');
    }

    console.log('Treino gerado com sucesso');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao gerar treino:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
