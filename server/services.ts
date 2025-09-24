import { GoogleGenAI, Type } from "@google/genai";
import { ThreatOption, AnalyzedThreat, PlayerResponse, SecurityCard, UserStoryInput, V2VotingData } from './types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateThreatOptions = async (userStory: string, contextoOpcional?: string): Promise<ThreatOption[]> => {
    const contextoTexto = contextoOpcional ? `\nContexto adicional: "${contextoOpcional}"` : '';
    
    const prompt = `
Você é o Mestre de Jogo do Carcará Threat Poker. Gere 4 alternativas de AMEAÇAS plausíveis a partir da user story abaixo.
Regras:
- Foque na AMEAÇA (não na mitigação).
- Inclua 2–3 opções fortes e 1–2 verossímeis porém menos prioritárias.
- Não diga quais são corretas.
Saída: JSON {"options":[{"id":"A","description":"..."}, ...]}

User story: "${userStory}"${contextoTexto}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                             required: ["id", "description"]
                        }
                    }
                },
                required: ["options"]
            },
        },
    });
    
    const jsonString = response?.text ? response.text.trim() : null;
    if (!jsonString) {
        throw new Error("Empty response from Gemini API for threat options.");
    }
    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse.options || !Array.isArray(parsedResponse.options)) {
        throw new Error("Invalid response format from Gemini API for threat options.");
    }

    return parsedResponse.options;
};

export const analyzeThreats = async (
    userStory: string,
    allOptions: ThreatOption[],
    playerResponses: PlayerResponse[]
): Promise<AnalyzedThreat[]> => {

    const allOptionsString = allOptions.map(opt => `- Opção ${opt.id}: ${opt.description}`).join('\n');
    
    const playerResponsesString = playerResponses.map(res =>
        ` - Jogador ${res.playerId + 1} escolheu a Opção ${res.selectedOption.id} ("${res.selectedOption.description}") com a justificativa: "${res.justification}"`
    ).join('\n');

    const prompt = `
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
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analyzedOptions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                description: { type: Type.STRING },
                                risk: { type: Type.STRING, enum: ["baixo", "médio", "alto", "crítico"] },
                                mitigationEffort: { type: Type.STRING, enum: ["baixo", "médio", "alto", "muito alto"] },
                                analysis: { type: Type.STRING },
                                sammPractice: { type: Type.STRING }
                            },
                             required: ["id", "description", "risk", "mitigationEffort", "analysis", "sammPractice"]
                        }
                    }
                },
                required: ["analyzedOptions"]
            },
        },
    });

    const jsonString = response?.text ? response.text.trim() : null;
    if (!jsonString) {
        throw new Error("Empty response from Gemini API for threat analysis.");
    }
    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse.analyzedOptions || !Array.isArray(parsedResponse.analyzedOptions)) {
        throw new Error("Invalid response format from Gemini API for threat analysis.");
    }
    
    return parsedResponse.analyzedOptions;
};

// Calculate ASP score: risco (1-10) × esforço (1-10) = 0-100
export const calculateASP = (risco: number, esforco: number): number => {
    return risco * esforco;
};

// Generate Security Cards v2 with OWASP Top 10, CWE, CVSS 4.0, Cheat Sheets
export const generateSecurityCards = async (
    userStories: UserStoryInput[],
    contextoOpcional?: string,
    votingData?: V2VotingData[]
): Promise<SecurityCard[]> => {
    const allCards: SecurityCard[] = [];
    
    for (const story of userStories.filter(s => s.selected)) {
        // Generate threat options for this story
        const threatOptions = await generateThreatOptions(story.content, contextoOpcional);
        
        // Find voting data for this story if available
        const storyVoting = votingData?.find(v => v.storyId === story.id);
        
        // Generate security cards for each threat option
        for (const option of threatOptions) {
            const card = await generateSecurityCard(story.content, option, storyVoting);
            allCards.push(card);
        }
    }
    
    // Calculate ASP scores and sort by priority (highest first)
    allCards.forEach(card => {
        card.asp_score = calculateASP(card.insumos_asp.risco.valor, card.insumos_asp.esforco.valor);
    });
    
    return allCards.sort((a, b) => (b.asp_score || 0) - (a.asp_score || 0));
};

// Generate a single Security Card with full v2 analysis
export const generateSecurityCard = async (
    userStory: string,
    threatOption: ThreatOption,
    votingData?: V2VotingData
): Promise<SecurityCard> => {
    // Include voting context if available
    const votingContext = votingData ? `

Contexto de Votação da Equipe:
- Opção selecionada pela equipe: ${votingData.selectedOptionId}
- Justificativa: "${votingData.quickJustification}"
- Esta análise é para a opção ${threatOption.id}${votingData.selectedOptionId === threatOption.id ? ' (ESCOLHIDA PELA EQUIPE)' : ' (não escolhida pela equipe)'}` : '';
    
    const prompt = `
Você é consultora de segurança. Para a opção apresentada, produza a análise seguindo estritamente o schema.
Regras:
- OWASP Top 10 e CWE como hipóteses com "confianca" (0–1).
- CVSS informativo (4.0): vetor, pontuacao_base, severidade, e "confianca".
- 2+ OWASP Cheat Sheets oficiais (título + URL).
- NÃO calcule ASP. Preencha SOMENTE insumos_asp: risco (1–10) e esforço (1–10) nas escalas do Carcará.
- Subtarefas acionáveis; DoD objetivo.
- Saída: JSON estrito conforme schema.

User Story: "${userStory}"
Opção: "${threatOption.id}: ${threatOption.description}"${votingContext}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    card_id: { type: Type.STRING },
                    user_story: { type: Type.STRING },
                    ameaca_titulo: { type: Type.STRING },
                    descricao_ameaca: { type: Type.STRING },
                    classificacoes: {
                        type: Type.OBJECT,
                        properties: {
                            owasp_top10: {
                                type: Type.OBJECT,
                                properties: {
                                    categoria: { type: Type.STRING },
                                    confianca: { type: Type.NUMBER }
                                },
                                required: ["categoria", "confianca"]
                            },
                            cwe: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    nome: { type: Type.STRING },
                                    confianca: { type: Type.NUMBER }
                                },
                                required: ["id", "nome", "confianca"]
                            },
                            cvss: {
                                type: Type.OBJECT,
                                properties: {
                                    versao: { type: Type.STRING, enum: ["4.0"] },
                                    vetor: { type: Type.STRING },
                                    pontuacao_base: { type: Type.NUMBER },
                                    severidade: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                                    confianca: { type: Type.NUMBER }
                                },
                                required: ["versao", "vetor", "pontuacao_base", "severidade", "confianca"]
                            }
                        },
                        required: ["owasp_top10", "cwe", "cvss"]
                    },
                    cheat_sheets: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                titulo: { type: Type.STRING },
                                url: { type: Type.STRING }
                            },
                            required: ["titulo", "url"]
                        }
                    },
                    insumos_asp: {
                        type: Type.OBJECT,
                        properties: {
                            risco: {
                                type: Type.OBJECT,
                                properties: {
                                    escala: { type: Type.STRING, enum: ["1-10"] },
                                    valor: { type: Type.NUMBER }
                                },
                                required: ["escala", "valor"]
                            },
                            esforco: {
                                type: Type.OBJECT,
                                properties: {
                                    escala: { type: Type.STRING, enum: ["1-10"] },
                                    valor: { type: Type.NUMBER }
                                },
                                required: ["escala", "valor"]
                            }
                        },
                        required: ["risco", "esforco"]
                    },
                    decisao_sprint_sugerida: { type: Type.STRING, enum: ["Selecionar", "Adiar", "Avaliar"] },
                    subtarefas_sugeridas: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    dod_seguranca: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    observacoes: { type: Type.STRING },
                    versao_esquema: { type: Type.STRING }
                },
                required: [
                    "card_id", "user_story", "ameaca_titulo", "descricao_ameaca",
                    "classificacoes", "cheat_sheets", "insumos_asp",
                    "decisao_sprint_sugerida", "subtarefas_sugeridas", "dod_seguranca",
                    "observacoes", "versao_esquema"
                ]
            }
        }
    });
    
    const jsonString = response?.text ? response.text.trim() : null;
    if (!jsonString) {
        throw new Error("Empty response from Gemini API for security card generation.");
    }
    
    const parsedCard = JSON.parse(jsonString);
    
    // Ensure card_id is unique if not provided
    if (!parsedCard.card_id || parsedCard.card_id === '') {
        parsedCard.card_id = `SEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set version if not provided
    if (!parsedCard.versao_esquema) {
        parsedCard.versao_esquema = "1.1.0";
    }
    
    return parsedCard as SecurityCard;
};
