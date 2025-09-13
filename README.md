# 🎴 Carcará Threat Poker

**Carcará Threat Poker** é uma ferramenta de análise de risco gamificada, projetada para equipes de desenvolvimento ágil. Utilizando o poder da IA generativa com a API do Google Gemini e se baseando no framework OWASP SAMM, a aplicação transforma o processo, muitas vezes complexo e demorado, de modelagem de ameaças em uma atividade interativa, educativa e rápida.

## A Necessidade: Análise de Risco Ágil e Acessível

Em ambientes de desenvolvimento ágil, a segurança precisa ser integrada de forma contínua, não como um gargalo no final do ciclo. No entanto, a modelagem de ameaças tradicional pode ser:

-   **Lenta e Complexa:** Exige sessões longas e conhecimento especializado, o que nem sempre se encaixa em sprints curtos.
-   **Intimidante:** Desenvolvedores podem não ter um background profundo em cibersegurança, dificultando a identificação proativa de ameaças.
-   **Desconectada do Backlog:** Os resultados das análises podem ser difíceis de traduzir em ações concretas e priorizáveis para a equipe.

O Carcará Threat Poker resolve esses problemas ao "gamificar" o processo. Ele usa um formato de jogo de cartas para encorajar o pensamento crítico e a colaboração, enquanto a IA atua como uma especialista em segurança sob demanda, fornecendo insights técnicos de forma instantânea.

## O Funcionamento: Uma Rodada de Jogo

A interação é dividida em etapas claras, guiando a equipe desde a definição do escopo até a criação de um item acionável para o backlog.

1.  **Configuração (Setup):** O jogo começa com um membro da equipe (ou o time todo) inserindo uma *user story*, tarefa ou descrição de funcionalidade que será analisada. É possível escolher entre o modo "Jogo Solo" (para análise individual) ou "Jogo em Grupo".

2.  **Geração de Opções:** A aplicação envia a *user story* para a API do Gemini. A IA, atuando como um "Mestre de Jogo", gera 4 opções de ameaças de segurança distintas e plausíveis relacionadas àquela história. Para estimular o debate, algumas opções são ameaças relevantes e outras são "blefes" — ameaças menos prioritárias ou sutilmente incorretas.

3.  **Votação e Justificativa:** Cada jogador analisa as 4 opções e vota naquela que considera ser a ameaça mais crítica. Além do voto, o jogador deve escrever uma breve justificativa para sua escolha. Isso força a reflexão e serve como input para a próxima fase.

4.  **Análise do Especialista (IA):** Após todos os jogadores votarem, a aplicação envia o contexto completo para a API do Gemini: a *user story* original, todas as 4 opções de ameaça e o conjunto de votos e justificativas da equipe. Desta vez, a IA atua como uma "Consultora Especialista em Cibersegurança". Ela analisa **cada uma das 4 opções individualmente**, fornecendo:
    -   Uma avaliação do nível de **Risco** (baixo, médio, alto, crítico).
    -   Uma estimativa do **Esforço de Mitigação** (baixo, médio, alto, muito alto).
    -   Uma **análise técnica** explicando a validade da ameaça.
    -   A **prática do OWASP SAMM** correspondente.

5.  **Decisão da Equipe:** A equipe visualiza o painel com a análise da IA para todas as opções, lado a lado. Com base nos insights do especialista, eles discutem e tomam uma decisão final sobre qual ameaça deve ser priorizada para mitigação.

6.  **Gamecard para o Backlog:** Após a decisão final, a aplicação gera um **"Gamecard"**. Este é um resumo estruturado que contém a tarefa, a ameaça escolhida, a análise da IA e uma ação sugerida. O card é formatado para ser facilmente copiado e colado em ferramentas de gerenciamento de projetos como Jira, Trello ou Azure DevOps.

## Interação com a IA Generativa (Prompts)

A inteligência do Carcará Threat Poker vem de uma interação de duas fases com a API do Gemini, utilizando dois prompts distintos e bem definidos.

---

### Fase 1: Geração de Opções de Ameaça

Nesta fase, a IA assume o papel de um Mestre de Jogo criativo, cujo objetivo é criar um cenário de discussão interessante para a equipe.

**🤖 Prompt de Geração:**
```
Você é um Mestre de Jogo de "Carcará Theat Poker", especialista em cibersegurança e na aplicação do framework OWASP SAMM. Seu objetivo é ajudar uma equipe de desenvolvimento a analisar riscos de forma gamificada e educativa.

A equipe forneceu a seguinte user story:
"${userStory}"

Com base nesta história, gere 4 alternativas distintas para uma potencial ameaça de segurança. Cada alternativa deve focar no *problema* (a ameaça), não na *solução* (a mitigação). A equipe irá discutir as mitigações depois. Cada ameaça deve se relacionar a uma prática de segurança do OWASP SAMM (ex: Análise de Ameaças, Testes de Segurança, Gerenciamento de Defeitos).
- Crie 2-3 opções que sejam ameaças de segurança plausíveis e relevantes.
- Crie 1-2 opções que sejam incorretas, sutilmente falhas ou menos prioritárias, mas que pareçam verossímeis para um não especialista.
- NÃO rotule quais são corretas ou incorretas.
- Use o formato "Opção A", "Opção B", etc., no seu pensamento, mas o JSON final deve ter apenas o ID e a descrição.

Retorne a resposta como um objeto JSON com uma única chave "options", que é um array de objetos. Cada objeto deve ter duas chaves: "id" (ex: "A", "B", "C", "D") e "description" (o texto da opção).
```

---

### Fase 2: Análise das Ameaças

Após a equipe interagir com as opções, a IA muda de papel para se tornar uma analista técnica, fornecendo uma avaliação objetiva e especializada.

**🤖 Prompt de Análise:**
```
Você é um consultor especialista em cibersegurança e análise de risco, com foco no framework OWASP SAMM. Sua tarefa é fornecer uma análise técnica para a equipe de desenvolvimento.

Aqui está o contexto completo:
1.  **User Story Original:** "${userStory}"
2.  **Opções de Ameaça Apresentadas:**
    ${allOptionsString}
3.  **Respostas e Justificativas da Equipe:**
    ${playerResponsesString}

Sua tarefa é analisar CADA UMA das opções apresentadas (A, B, C, etc.) individualmente. Para cada opção, você deve:
1.  Avaliar a validade e a relevância da ameaça no contexto do OWASP SAMM.
2.  Estimar o nível de RISCO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "crítico".
3.  Estimar o ESFORÇO DE MITIGAÇÃO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "muito alto".
4.  Escrever uma "analysis" concisa, explicando sua avaliação de risco e esforço.
5.  Identificar a principal **prática de segurança do OWASP SAMM** relacionada. Formate como 'Função de Negócio > Prática de Segurança' (ex: 'Verificação > Testes de Segurança').

Retorne sua análise como um objeto JSON com uma única chave "analyzedOptions", que é um array de objetos. Cada objeto deve corresponder a uma das opções originais e ter a seguinte estrutura:
{
  "id": "A",
  "description": "A descrição original da Opção A.",
  "risk": "...",
  "mitigationEffort": "...",
  "analysis": "Sua análise técnica concisa para esta opção.",
  "sammPractice": "Função > Prática"
}
```

A utilização desses dois prompts em sequência garante um fluxo de jogo que é ao mesmo tempo criativo, educativo e tecnicamente fundamentado, transformando a análise de risco em um pilar da cultura de desenvolvimento seguro.
