# 🎴 Carcará Threat Poker v2

**Carcará Threat Poker** é uma dinâmica leve de análise de risco para equipes ágeis. Com IA generativa atuando como **especialista consultiva**, transforma um processo tradicionalmente complexo em uma etapa rápida durante as *plannings*. 

## 🚀 Novidades da v2

A versão 2.0 introduz os **Cards de Segurança** - uma abordagem mais direta e técnica:

- **Análise simultânea**: múltiplas user stories de uma só vez
- **Classificações técnicas automáticas**: STRIDE, OWASP Top 10, CWE, CVSS 4.0
- **Priorização ASP**: Risco (1-10) × Esforço (1-10) = Score 0-100
- **Documentação rica**: Subtarefas, DoD de segurança, OWASP Cheat Sheets
- **Integração ágil**: saída pronta para ferramentas de backlog

**A ferramenta não exige que desenvolvedores realizem modelagem de ameaças** - a IA propõe cenários, classifica riscos e gera cards completos prontos para o backlog.

## 🎯 Dois Modos de Operação

### 🏃 Modo Clássico (v1) - Poker Interativo
Jogo tradicional com votação em equipe:
- Votação e justificativas colaborativas
- Análise de especialista pós-votação
- 1 gamecard por rodada
- Ideal para workshops e dinâmicas

### 🚀 Modo Cards de Segurança (v2) - Análise Direta
Abordagem ágil para plannings com **votação opcional**:
- **⚡ Modo Rápido**: IA gera diretamente os cards (ideal para plannings)
- **🏃 Modo Colaborativo**: inclui votação rápida da equipe para mais contexto
- **Integra ao fluxo ágil**: sai da planning como **tickets** com subtarefas e DoD
- **Priorização objetiva**: **ASP** ranqueia automaticamente, com destaque visual e cálculo Risco × Esforço por card
- **Governança clara**: STRIDE como técnica de modelagem de ameaças; cards técnicos com Top 10/CWE/Cheat Sheets
- **Duas visualizações**: lista completa ou acordeão (um card por vez, navegável)

## 🎁 Fluxo Operacional v2

### ⚡ Modo Rápido (Recomendado para Plannings)
1. **Seleção de histórias** (PO): escolha 1–N histórias candidatas
2. **Contexto opcional**: informações técnicas adicionais
3. **Geração direta**: IA cria Cards de Segurança com classificações técnicas
4. **Priorização ASP**: ordenação automática por score
5. **Seleção para backlog**: escolha e exporte cards prioritários

### 🏃 Modo Colaborativo (Com Votação)
1. **Seleção de histórias**: igual ao modo rápido + checkbox "Incluir votação"
2. **Geração de opções**: IA propõe 4 ameaças por história
3. **Votação rápida**: equipe vota e justifica (1-2 frases)
4. **Análise contextualizada**: IA usa votações para gerar cards mais precisos
5. **Priorização e seleção**: igual ao modo rápido

## 🖥️ Visualização dos Cards de Segurança (v2)

Após a geração, os cards são exibidos ordenados pelo **score ASP** (maior prioridade primeiro). A tela oferece dois modos de visualização, alternáveis por um botão no topo:

- **📋 Lista** (padrão): todos os cards empilhados, ideal para uma visão geral e seleção em lote.
- **🗂️ Acordeão**: um card por vez, com navegação **◀ Anterior / Próximo ▶**, contador "Card X de N" e indicadores (dots) clicáveis. Útil para revisar card a card durante a discussão.

Cada card destaca a **priorização ASP** com:
- O **score (0–100)** em evidência, colorido por faixa de prioridade (**Crítica** ≥ 81, **Alta** ≥ 61, **Média** ≥ 41, **Baixa** < 41);
- Uma **barra de progresso** proporcional ao score;
- Os insumos **Risco (1-10)** e **Esforço (1-10)** e o **cálculo explícito** `Risco × Esforço = Score`.

A seleção de cards para o backlog é feita pelo **checkbox** de cada card (ou "Selecionar Todos") e exportada com o botão **🚀 Enviar para Backlog**. Cada card também pode ser copiado individualmente em formato pronto para Jira/Trello/Azure DevOps.

## 🎴 Funcionamento Clássico (v1)

O modo original com interação dividida em etapas claras:

1.  **Configuração (Setup):** O jogo começa com um membro da equipe (ou o time todo) inserindo uma *user story*, tarefa ou descrição de funcionalidade que será analisada. É possível escolher entre o modo "Jogo Solo" (para análise individual) ou "Jogo em Grupo".

2.  **Geração de Opções:** A aplicação envia a *user story* para a API do Gemini. A IA, atuando como um "Mestre de Jogo", gera 4 opções de ameaças de segurança distintas e plausíveis relacionadas àquela história. Para estimular o debate, algumas opções são ameaças relevantes e outras são "blefes" — ameaças menos prioritárias ou sutilmente incorretas.

3.  **Votação e Justificativa:** Cada jogador analisa as 4 opções e vota naquela que considera ser a ameaça mais crítica. Além do voto, o jogador deve escrever uma breve justificativa para sua escolha. Isso força a reflexão e serve como input para a próxima fase.

4.  **Análise do Especialista (IA):** Após todos os jogadores votarem, a aplicação envia o contexto completo para a API do Gemini: a *user story* original, todas as 4 opções de ameaça e o conjunto de votos e justificativas da equipe. Desta vez, a IA atua como uma "Consultora Especialista em Cibersegurança". Ela analisa **cada uma das 4 opções individualmente**, fornecendo:
    -   Uma avaliação do nível de **Risco** (baixo, médio, alto, crítico).
    -   Uma estimativa do **Esforço de Mitigação** (baixo, médio, alto, muito alto).
    -   Uma **análise técnica** explicando a validade da ameaça.
    -   A **classificação STRIDE** correspondente.

5.  **Decisão da Equipe:** A equipe visualiza o painel com a análise da IA para todas as opções, lado a lado. Com base nos insights do especialista, eles discutem e tomam uma decisão final sobre qual ameaça deve ser priorizada para mitigação.

6.  **Gamecard para o Backlog:** Após a decisão final, a aplicação gera um **"Gamecard"**. Este é um resumo estruturado que contém a tarefa, a ameaça escolhida, a análise da IA e uma ação sugerida. O card é formatado para ser facilmente copiado e colado em ferramentas de gerenciamento de projetos como Jira, Trello ou Azure DevOps.

## 🚀 Executando Localmente

Para executar o Carcará Threat Poker localmente, use o Docker Compose.

### Docker Compose

Sobe tudo (nginx + frontend + backend) em um único container, usando o `Dockerfile` já existente. O nginx serve o frontend na porta `8080` e faz proxy de `/api/` para o backend Node.

**Pré-requisitos:** [Docker](https://docs.docker.com/get-docker/) (com Docker Compose) e uma chave de API do Google Gemini, obtida no [Google AI Studio](https://aistudio.google.com/app/apikey).

1.  **Configure a chave de API:**
    ```bash
    cp .env.example .env
    # edite o .env e preencha GEMINI_API_KEY com a chave do Google AI Studio
    ```

2.  **Suba a aplicação:**
    ```bash
    docker compose up --build
    ```

3.  Acesse `http://localhost:8080`.

Para rodar em background use `docker compose up --build -d`, e `docker compose down` para encerrar.

## Interação com a IA Generativa (Prompts)

A inteligência do Carcará Threat Poker vem de uma interação de duas fases com a API do Gemini, utilizando dois prompts distintos e bem definidos.

---

### Fase 1: Geração de Opções de Ameaça

Nesta fase, a IA assume o papel de um Mestre de Jogo criativo, cujo objetivo é criar um cenário de discussão interessante para a equipe.

**🤖 Prompt de Geração:**
```
Você é o Mestre de Jogo do Carcará Threat Poker, especialista em modelagem de ameaças com STRIDE. Seu objetivo é ajudar uma equipe de desenvolvimento a analisar riscos de forma gamificada e educativa.

A equipe forneceu a seguinte user story:
"${userStory}"

Com base nesta história, gere 4 alternativas distintas para uma potencial ameaça de segurança. Cada alternativa deve focar no *problema* (a ameaça), não na *solução* (a mitigação). A equipe irá discutir as mitigações depois.
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
Você é uma consultora especialista em segurança e modelagem de ameaças (STRIDE). Sua tarefa é fornecer uma análise técnica para a equipe de desenvolvimento.

Aqui está o contexto completo:
1.  **User Story Original:** "${userStory}"
2.  **Opções de Ameaça Apresentadas:**
    ${allOptionsString}
3.  **Respostas e Justificativas da Equipe:**
    ${playerResponsesString}

Sua tarefa é analisar CADA UMA das opções apresentadas (A, B, C, etc.) individualmente. Para cada opção, você deve:
1.  Classificar a ameaça segundo o STRIDE (uma ou mais categorias: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
2.  Estimar o nível de RISCO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "crítico".
3.  Estimar o ESFORÇO DE MITIGAÇÃO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "muito alto".
4.  Escrever uma "analysis" concisa, explicando sua avaliação de risco e esforço com base na classificação STRIDE.

Retorne sua análise como um objeto JSON com uma única chave "analyzedOptions", que é um array de objetos. Cada objeto deve corresponder a uma das opções originais e ter a seguinte estrutura:
{
  "id": "A",
  "description": "A descrição original da Opção A.",
  "risk": "...",
  "mitigationEffort": "...",
  "analysis": "Sua análise técnica concisa para esta opção.",
  "stride": ["Spoofing", "Tampering"]
}
```

A utilização desses dois prompts em sequência garante um fluxo de jogo que é ao mesmo tempo criativo, educativo e tecnicamente fundamentado, transformando a análise de risco em um pilar da cultura de desenvolvimento seguro.
