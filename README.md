# 🎴 Carcará Threat Poker v2

**Carcará Threat Poker** é uma dinâmica leve de análise de risco para equipes ágeis. Com IA generativa atuando como **especialista consultiva**, transforma um processo tradicionalmente complexo em uma etapa rápida durante as *plannings*. 

## 🚀 Novidades da v2

A versão 2.0 introduz os **Cards de Segurança** - uma abordagem mais direta e técnica:

- **Análise simultânea**: múltiplas user stories de uma só vez
- **Classificações técnicas automáticas**: OWASP Top 10, CWE, CVSS 4.0
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
- **Priorização objetiva**: **ASP** ranqueia automaticamente
- **Governança clara**: SAMM para maturidade; cards técnicos com Top 10/CWE/Cheat Sheets

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

## 🎴 Funcionamento Clássico (v1)

O modo original com interação dividida em etapas claras:

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

## 🚀 Executando Localmente

Para executar o Carcará Threat Poker em sua máquina local, siga estes passos.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18.x ou superior)
*   [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)
*   Uma chave de API do Google Gemini. Você pode obter uma no [Google AI Studio](https://aistudio.google.com/app/apikey).

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    # Substitua pela URL correta do seu repositório
    git clone https://github.com/seu-usuario/carcara-threat-poker.git
    cd carcara-threat-poker
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure suas variáveis de ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto e adicione sua chave de API do Google Gemini:
    ```env
    GEMINI_API_KEY=SUA_CHAVE_API_DO_GEMINI
    ```
    Substitua `SUA_CHAVE_API_DO_GEMINI` pela chave real que você obteve no Google AI Studio.

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Abra seu navegador e acesse o endereço fornecido no terminal (geralmente `http://localhost:5173`).

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
