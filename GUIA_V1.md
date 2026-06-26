# 🏃 Guia v1 — Modo Clássico (Poker Interativo)

> Novo por aqui? Comece pela [fundamentação e escolha do modo](./GUIA_DE_USO.md).

Modo colaborativo em etapas, ideal para **workshops e dinâmicas de equipe**, estimulando o debate sobre segurança. Gera **1 gamecard por rodada**.

## 1. Configuração
Informe a *user story* (ou tarefa) a ser analisada e escolha entre **Jogo Solo** (individual) ou **Jogo em Grupo**.

![Configuração da rodada](imagens/v1/v1-01-configuracao.png)

## 2. Geração de opções
A IA, atuando como **Mestre de Jogo** (especialista em modelagem de ameaças com STRIDE), gera **4 opções de ameaça** plausíveis para a história — algumas relevantes e outras menos prioritárias, para estimular a discussão.

![Geração das opções de ameaça](imagens/v1/v1-02-geracao-de-opcoes.png)

## 3. Votação
Cada jogador escolhe a ameaça que considera mais crítica.

![Votação](imagens/v1/v1-03-votacao.png)

## 4. Justificativa
Além do voto, o jogador escreve uma breve justificativa — isso força a reflexão e serve de contexto para a análise.

![Votação com justificativa](imagens/v1/v1-04-votacao-justificativa.png)

## 5. Análise do especialista (IA)
Com todos os votos e justificativas, a IA analisa **cada uma das 4 opções**, indicando **Risco**, **Esforço de mitigação**, uma **análise técnica** e a **classificação STRIDE** correspondente.

![Análise do especialista](imagens/v1/v1-05-analise-do-especialista.png)

## 6. Decisão da equipe
A equipe discute o painel lado a lado e decide qual ameaça priorizar para mitigação.

![Decisão da equipe](imagens/v1/v1-06-decisao-da-equipe.png)

## 7. Gamecard para o backlog
A aplicação gera um **Gamecard** estruturado (tarefa, ameaça escolhida, análise, classificação STRIDE e ação sugerida), pronto para copiar e colar em ferramentas como Jira, Trello ou Azure DevOps.

![Gamecard final](imagens/v1/v1-07-gamecard.png)

---

> 🤖 Lembrete: a IA atua como **especialista consultiva** — a decisão final de priorização e aceite é sempre da equipe.
>
> ➡️ Veja também o [Guia v2 — Cards de Segurança](./GUIA_V2.md).
