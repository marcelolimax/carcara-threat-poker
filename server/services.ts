import { GoogleGenAI, Type } from "@google/genai";
import { ThreatOption, AnalyzedThreat, PlayerResponse, SecurityCard, UserStoryInput, V2VotingData } from './types';

/**
 * Inicializa o cliente do Gemini suportando dois provedores:
 *  - Vertex AI (service account via variáveis de ambiente): defina
 *    GOOGLE_GENAI_USE_VERTEXAI=true, GOOGLE_CLOUD_PROJECT, GOOGLE_CLIENT_EMAIL e
 *    GOOGLE_PRIVATE_KEY (opcional GOOGLE_CLOUD_LOCATION, default us-central1).
 *    Não usa arquivo JSON: as credenciais vêm direto do ambiente.
 *  - Gemini Developer API (chave): defina GEMINI_API_KEY.
 * O Vertex AI não usa a cota free-tier de 20 req/dia do Developer API.
 */
const useVertex =
    process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true' ||
    process.env.GOOGLE_GENAI_USE_VERTEXAI === '1';

let ai: GoogleGenAI;

if (useVertex) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // A private key vem em uma única linha no .env; restauramos as quebras de linha.
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!project) {
        throw new Error("GOOGLE_CLOUD_PROJECT is required when GOOGLE_GENAI_USE_VERTEXAI is enabled");
    }
    if (!clientEmail || !privateKey) {
        throw new Error("GOOGLE_CLIENT_EMAIL e GOOGLE_PRIVATE_KEY são obrigatórios para autenticar no Vertex AI via variáveis de ambiente");
    }

    ai = new GoogleGenAI({
        vertexai: true,
        project,
        location,
        googleAuthOptions: {
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
        },
    });
    console.log(`[IA] Usando Vertex AI (project=${project}, location=${location})`);
} else {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Defina GEMINI_API_KEY (Gemini Developer API) ou GOOGLE_GENAI_USE_VERTEXAI=true com as credenciais do Vertex AI");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('[IA] Usando Gemini Developer API (chave)');
}

export const generateThreatOptions = async (userStory: string, contextoOpcional?: string): Promise<ThreatOption[]> => {
    const contextoTexto = contextoOpcional ? `\nContexto adicional: "${contextoOpcional}"` : '';
    
    const prompt = `
Você é o Mestre de Jogo do Carcará Threat Poker, especialista em modelagem de ameaças com STRIDE.
Objetivo: ajudar a equipe a analisar riscos de forma educativa, gerando alternativas de AMEAÇA (sem mitigações) a partir da user story abaixo.
Regras:
- Foque na AMEAÇA (o PROBLEMA), não na mitigação.
- Gere 4 alternativas distintas; 2–3 devem ser ameaças relevantes e 1–2 menos prioritárias para contraste.
- Não inclua mitigação nesta fase e não diga quais são corretas.
- Não explique fora do JSON; não use markdown; não repita a história.
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
    Você é uma Consultora Especialista em segurança e modelagem de ameaças (STRIDE). Sua tarefa é fornecer uma análise técnica para a equipe de desenvolvimento.

    Aqui está o contexto completo:
    1.  **User Story Original:** "${userStory}"
    2.  **Opções de Ameaça Apresentadas:**
        ${allOptionsString}
    3.  **Respostas e Justificativas da Equipe:**
        ${playerResponsesString}

    Sua tarefa é analisar CADA UMA das opções apresentadas (A, B, C, etc.) individualmente. Para cada opção, você deve:
    1.  Classificar a ameaça segundo o STRIDE (uma ou mais categorias entre: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
    2.  Estimar o nível de RISCO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "crítico".
    3.  Estimar o ESFORÇO DE MITIGAÇÃO. Use estritamente um dos seguintes valores: "baixo", "médio", "alto", "muito alto".
    4.  Escrever uma "analysis" concisa, explicando sua avaliação de risco e esforço com base na classificação STRIDE.

    Regras:
    - Não invente bibliografia; use apenas a taxonomia STRIDE solicitada.
    - A decisão final de priorização é da equipe.

    Retorne sua análise como um objeto JSON com uma única chave "analyzedOptions", que é um array de objetos. Cada objeto deve corresponder a uma das opções originais e ter a seguinte estrutura:
    {
      "id": "A",
      "description": "A descrição original da Opção A.",
      "risk": "...",
      "mitigationEffort": "...",
      "analysis": "Sua análise técnica concisa para esta opção.",
      "stride": ["Spoofing", "Tampering"]
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
                                stride: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                             required: ["id", "description", "risk", "mitigationEffort", "analysis", "stride"]
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

// Tabelas de conversão da monografia (nível -> valor), de modo que valores maiores
// signifiquem maior prioridade. O Risco é diretamente proporcional e o Esforço de
// Mitigação é INVERSAMENTE proporcional (menor esforço => maior valor).
export const RISCO_VALOR: Record<string, number> = { 'baixo': 1, 'médio': 3, 'alto': 8, 'crítico': 10 };
export const ESFORCO_VALOR: Record<string, number> = { 'muito alto': 3, 'alto': 5, 'médio': 8, 'baixo': 10 };

// Calculate ASP score: R × EM (valores já convertidos pelas tabelas) = 0-100
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
        
        // Generate security cards for each threat option in parallel (reduz latência)
        const storyCards = await Promise.all(
            threatOptions.map(option => generateSecurityCard(story.content, option, storyVoting))
        );
        allCards.push(...storyCards);
    }
    
    // Calculate ASP scores and sort by priority (highest first)
    allCards.forEach(card => {
        card.asp_score = calculateASP(card.insumos_asp.risco.valor, card.insumos_asp.esforco.valor);
    });

    // Garante card_id único entre todos os cards. A IA pode repetir o mesmo id
    // (ex.: "SEC-001") em chamadas independentes, o que quebra a renderização e a
    // seleção no frontend. Aqui adicionamos um sufixo incremental em colisões.
    const seenIds = new Set<string>();
    allCards.forEach((card, idx) => {
        let id = card.card_id && card.card_id.trim() !== '' ? card.card_id.trim() : `SEC-${idx + 1}`;
        if (seenIds.has(id)) {
            let suffix = 2;
            while (seenIds.has(`${id}-${suffix}`)) suffix++;
            id = `${id}-${suffix}`;
        }
        seenIds.add(id);
        card.card_id = id;
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
Você é consultora especialista em segurança. Analise a ameaça e produza um Card de Segurança completo.

REGRAS OBRIGATÓRIAS:
1. STRIDE: classifique a ameaça em uma ou mais categorias (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
2. OWASP Top 10: escolha a categoria mais adequada com confiança 0.6-0.9
3. CWE: identifique o CWE específico com confiança 0.6-0.9  
4. CVSS 4.0: calcule o vetor completo com confiança 0.6-0.9 (apenas informativo)
5. Cheat Sheets: forneça 2-3 links oficiais OWASP relevantes
6. Subtarefas: liste 3-5 ações técnicas específicas e implementáveis
7. DoD Segurança: defina 3-4 critérios objetivos e testáveis
8. Insumos ASP: informe APENAS o NÍVEL de risco (baixo/médio/alto/crítico) e o NÍVEL de esforço de mitigação (baixo/médio/alto/muito alto). NÃO informe números nem calcule o score — os valores e o ASP são calculados pelo sistema. Lembre que o esforço é inversamente proporcional: menor esforço favorece a priorização.
9. Observações: sempre inclua a frase padrão sobre CVSS/CWE serem informativos

EXEMPLO de subtarefas válidas:
- "Implementar validação de entrada com sanitização"
- "Configurar rate limiting no endpoint /api/login"
- "Adicionar logs de auditoria para operações sensíveis"

EXEMPLO de DoD válido:
- "Teste de penetração não encontra vulnerabilidade"
- "Scanner de código aprovado sem alertas críticos"
- "Code review confirma implementação das validações"

User Story: "${userStory}"
Ameaça: "${threatOption.id}: ${threatOption.description}"${votingContext}

Resposta obrigatória em JSON estrito conforme schema:
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
                            stride: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
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
                        required: ["stride", "owasp_top10", "cwe", "cvss"]
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
                                    nivel: { type: Type.STRING, enum: ["baixo", "médio", "alto", "crítico"] }
                                },
                                required: ["nivel"]
                            },
                            esforco: {
                                type: Type.OBJECT,
                                properties: {
                                    nivel: { type: Type.STRING, enum: ["baixo", "médio", "alto", "muito alto"] }
                                },
                                required: ["nivel"]
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

    // Converte os níveis informados pela IA em valores numéricos pelas tabelas da
    // monografia. O esforço é inversamente proporcional (menor esforço => maior valor).
    const riscoNivel = (parsedCard.insumos_asp?.risco?.nivel || 'médio').toString().toLowerCase();
    const esforcoNivel = (parsedCard.insumos_asp?.esforco?.nivel || 'médio').toString().toLowerCase();
    parsedCard.insumos_asp = {
        risco: { nivel: riscoNivel, valor: RISCO_VALOR[riscoNivel] ?? 3 },
        esforco: { nivel: esforcoNivel, valor: ESFORCO_VALOR[esforcoNivel] ?? 8 },
    };
    
    // Set version if not provided
    if (!parsedCard.versao_esquema) {
        parsedCard.versao_esquema = "1.1.0";
    }
    
    return parsedCard as SecurityCard;
};


// ───────────────────────── Carcará Rush (quiz arcade de taxonomia STRIDE) ─────────────────────────

export const STRIDE_CATEGORIES = [
    'Spoofing',
    'Tampering',
    'Repudiation',
    'Information Disclosure',
    'Denial of Service',
    'Elevation of Privilege',
];

export interface RushQuestion {
    scenario: string;     // cenário curto de ameaça
    stride: string;       // categoria STRIDE correta
    explicacao: string;   // por que é essa categoria
}

// Gera um lote de perguntas para o quiz (classificar a ameaça no STRIDE correto).
// Lote único por chamada para o jogo rodar sem latência por pergunta.
export const generateRushQuestions = async (theme: string, count = 10): Promise<RushQuestion[]> => {
    const tema = (theme || '').trim();
    const temaTxt = tema ? ` Use cenários variados no contexto de: "${tema}".` : ' Use cenários variados de sistemas diversos (web, mobile, APIs, IoT, nuvem).';
    const n = Math.max(5, Math.min(20, count));

    const prompt = `
Você é o Mestre de Jogo do "Carcará Rush", um quiz rápido de modelagem de ameaças.
Gere ${n} perguntas distintas. Cada pergunta descreve UM cenário concreto de ameaça de segurança em 1-2 frases, e tem UMA categoria STRIDE correta.${temaTxt}

Categorias STRIDE válidas (use exatamente estes rótulos): Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.

Regras:
- O cenário deve deixar a categoria identificável por quem conhece STRIDE, mas sem citar o nome da categoria nem entregá-la de graça.
- Varie as categorias ao longo das perguntas (não repita sempre a mesma).
- "explicacao": 1 frase curta dizendo por que é aquela categoria.
- Responda SOMENTE no JSON do schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                scenario: { type: Type.STRING },
                                stride: { type: Type.STRING, enum: STRIDE_CATEGORIES },
                                explicacao: { type: Type.STRING },
                            },
                            required: ['scenario', 'stride', 'explicacao'],
                        },
                    },
                },
                required: ['questions'],
            },
        },
    });

    const jsonString = response?.text ? response.text.trim() : null;
    if (!jsonString) throw new Error('Empty response from Gemini API for rush questions.');
    const parsed = JSON.parse(jsonString);
    const questions: RushQuestion[] = (parsed.questions || []).filter(
        (q: any) => q && q.scenario && STRIDE_CATEGORIES.includes(q.stride)
    );
    if (questions.length === 0) throw new Error('No valid rush questions generated.');
    return questions;
};
