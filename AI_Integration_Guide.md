# Guia de Integração da IA - EvolveFit

## Webhook Configurado
**URL**: `https://n8n.leplustudio.top/webhook-test/evolvefit-llm`

## Formato da Requisição

A aplicação envia requisições POST para o webhook com o seguinte formato:

```json
{
  "context": "workout_generation | progress_analysis | general_consultation",
  "question": "String com a pergunta ou solicitação",
  "userData": {
    "student": { /* dados do aluno */ },
    "preferences": { /* preferências de treino */ },
    "progress": { /* dados de progresso */ },
    "context": { /* contexto adicional */ },
    "action": "generate_workout | analyze_progress | general_advice"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Formato da Resposta Esperada

A LLM deve retornar respostas estruturadas no seguinte formato JSON:

### Para Consultas Gerais
```json
{
  "response": "Resposta detalhada da IA sobre a pergunta feita",
  "suggestions": [
    "Sugestão 1",
    "Sugestão 2", 
    "Sugestão 3"
  ]
}
```

### Para Geração de Treinos
```json
{
  "response": "Descrição completa do plano de treino gerado, incluindo objetivos, metodologia e progressão esperada. Mínimo 200 caracteres.",
  "suggestions": [
    "Aquecimento dinâmico",
    "Hidratação constante",
    "Descanso adequado",
    "Progressão gradual"
  ],
  "exercises": [
    {
      "name": "Supino reto",
      "muscle_group": "Peito",
      "equipment": "Barra",
      "sets": 3,
      "reps": "8-12",
      "rest": 90,
      "instructions": "Manter controle total do movimento"
    }
  ]
}
```

### Para Análise de Progresso
```json
{
  "response": "Análise detalhada do progresso do aluno, pontos positivos, áreas de melhoria e recomendações específicas.",
  "suggestions": [
    "Ajustar dieta",
    "Aumentar intensidade",
    "Focar na recuperação"
  ],
  "metrics": {
    "trend": "positive | negative | stable",
    "score": 85, // 0-100
    "next_goals": [
      "Reduzir 2% de gordura corporal",
      "Aumentar 3kg de massa muscular"
    ]
  }
}
```

## Contextos de Uso

### 1. workout_generation
**Quando**: Usuário gera treino com IA
**Dados recebidos**: 
- Informações do aluno (idade, peso, altura, objetivo)
- Preferências (foco, duração, frequência, nível)

**Resposta esperada**: Plano de treino detalhado e personalizado

### 2. progress_analysis  
**Quando**: Usuário analisa progresso com IA
**Dados recebidos**:
- Histórico de medições do aluno
- Dados de peso, gordura corporal, massa muscular
- Medidas corporais ao longo do tempo

**Resposta esperada**: Análise do progresso e recomendações

### 3. general_consultation
**Quando**: Usuário faz pergunta geral
**Dados recebidos**:
- Pergunta do usuário
- Contexto opcional (página atual, dados relevantes)

**Resposta esperada**: Conselho profissional e sugestões

## Exemplos de Implementação

### Exemplo 1: Geração de Treino
**Requisição**:
```json
{
  "context": "workout_generation",
  "question": "Gere um plano de treino personalizado baseado nos dados do aluno",
  "userData": {
    "student": {
      "nome": "João Silva",
      "idade": 30,
      "peso": 75,
      "altura": 1.75,
      "objetivo": "hipertrofia"
    },
    "preferences": {
      "goal": "hipertrofia",
      "duration": "8",
      "frequency": "4", 
      "level": "intermediario"
    },
    "action": "generate_workout"
  }
}
```

**Resposta**:
```json
{
  "response": "Plano de treino para hipertrofia muscular desenvolvido para João Silva, homem de 30 anos, focando em ganho de massa muscular. O programa de 8 semanas com frequência de 4x por semana utiliza sobrecarga progressiva, exercícios compostos e isoladores para maximizar o crescimento muscular. Divisão A-B-C-D contemplando todos os grupos musculares com volume e intensidade adequados para nível intermediário.",
  "suggestions": [
    "Consumir 2g de proteína por kg corporal",
    "Dormir 7-8 horas por noite",
    "Hidratar-se adequadamente",
    "Progredir cargas semanalmente"
  ]
}
```

### Exemplo 2: Análise de Progresso
**Requisição**:
```json
{
  "context": "progress_analysis", 
  "question": "Analise o progresso do aluno e forneça sugestões de melhoria",
  "userData": {
    "progress": [
      {
        "data": "2024-01-01",
        "peso": 75,
        "gordura": 15,
        "massa_muscular": 60
      },
      {
        "data": "2024-02-01", 
        "peso": 76,
        "gordura": 14,
        "massa_muscular": 62
      }
    ],
    "action": "analyze_progress"
  }
}
```

**Resposta**:
```json
{
  "response": "Excelente progresso! Em 1 mês houve ganho de 2kg de massa muscular e redução de 1% de gordura corporal, mantendo peso estável. Esta é a composição corporal ideal, indicando que o protocolo de treino e nutrição está sendo eficaz. A tendência positiva sugere que os objetivos estão sendo alcançados de forma saudável e sustentável.",
  "suggestions": [
    "Manter o protocolo atual",
    "Aumentar ligeiramente a intensidade",
    "Focar na recuperação muscular"
  ],
  "metrics": {
    "trend": "positive",
    "score": 92,
    "next_goals": [
      "Reduzir mais 1% de gordura",
      "Ganhar 1kg de massa muscular"
    ]
  }
}
```

## Diretrizes Importantes

### Conteúdo das Respostas
1. **Sempre em português brasileiro**
2. **Linguagem profissional mas acessível**
3. **Informações baseadas em evidências científicas**
4. **Respostas específicas e acionáveis**
5. **Considerar limitações e contraindicações**

### Estrutura Obrigatória
- Campo `response` sempre presente com mínimo 100 caracteres
- Campo `suggestions` com 2-5 sugestões práticas
- Campos específicos por contexto quando aplicável

### Tratamento de Erros
Se houver erro ou dados insuficientes, retorne:
```json
{
  "response": "Não foi possível processar sua solicitação devido a dados insuficientes. Por favor, forneça mais informações sobre [especificar o que falta].",
  "suggestions": [
    "Completar dados do aluno",
    "Adicionar informações de contexto"
  ]
}
```

## Integração Técnica

O sistema EvolveFit faz chamadas HTTP POST e espera:
- **Status 200** para sucesso
- **Content-Type**: `application/json`
- **Timeout**: 30 segundos
- **Tratamento de CORS** se necessário

Esta integração permite que a IA seja utilizada de forma contextual e eficiente em todo o sistema de gestão de personal trainer.