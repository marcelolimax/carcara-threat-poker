# 🏃 Guia v1 — Modo Clássico (Poker Interativo)

> Novo por aqui? Comece pela [fundamentação e escolha do modo](./GUIA_DE_USO.md).

Modo colaborativo em etapas, ideal para **workshops e dinâmicas de equipe**, estimulando o debate sobre segurança. Gera **1 gamecard por rodada**.

## 1. Configuração
Escolha o modo de jogo — **Solo** (análise individual) ou **em Grupo** — e quantos jogadores participam.

![Configuração da rodada](imagens/v1/v1-01-configuracao.png)

## 2. Descrição da história de usuário
Informe a *user story* (ou tarefa/funcionalidade) que será analisada.

![Descrição da história de usuário](imagens/v1/v1-02-descricao-da-historia.png)

## 3. Geração das opções
A IA, atuando como **Mestre de Jogo** (especialista em modelagem de ameaças com STRIDE), gera **4 opções de ameaça** plausíveis — algumas relevantes e outras menos prioritárias, para estimular a discussão.

![Geração das opções de ameaça](imagens/v1/v1-03-geracao-de-opcoes.png)

## 4. Escolha da melhor opção e justificativa
Cada jogador vota na ameaça que considera mais crítica e escreve uma breve **justificativa** — isso força a reflexão e serve de contexto para a análise.

![Escolha e justificativa](imagens/v1/v1-04-escolha-e-justificativa.png)

## 5. Análise da opção selecionada (IA)
Com os votos e justificativas, a IA analisa as opções indicando **Risco**, **Esforço de mitigação**, uma **análise técnica** e a **classificação STRIDE** correspondente.

![Análise da opção selecionada](imagens/v1/v1-05-analise-da-opcao.png)

## 6. Decisão da equipe
A equipe discute e escolhe a **melhor opção de mitigação** a ser priorizada.

![Decisão da equipe](imagens/v1/v1-06-decisao-da-equipe.png)

## 7. Card para o backlog
A aplicação gera um **Gamecard** estruturado (tarefa, ameaça escolhida, análise, classificação STRIDE e ação sugerida), pronto para copiar e colar em ferramentas como Jira, Trello ou Azure DevOps.

![Card para o backlog](imagens/v1/v1-07-gamecard.png)

---

> 🤖 Lembrete: a IA atua como **especialista consultiva** — a decisão final de priorização e aceite é sempre da equipe.
>
> ➡️ Veja também o [Guia v2 — Cards de Segurança](./GUIA_V2.md).
