import { GoogleGenAI, Type } from "@google/genai";
import { ThreatOption, AnalyzedThreat, PlayerResponse } from '../../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateThreatOptions = async (userStory: string): Promise<ThreatOption[]> => {
    const prompt = `
    Você é um Mestre de Jogo de "Carcará Theat Poker", especialista em cibersegurança e na aplicação do framework OWASP SAMM. Seu objetivo é ajudar uma equipe de desenvolvimento a analisar riscos de forma gamificada e educativa.

    A equipe forneceu a seguinte user story:
    "${userStory}"

    Com base nesta história, gere 4 alternativas distintas para uma potencial ameaça de segurança. Cada alternativa deve focar no *problema* (a ameaça), não na *solução* (a mitigação). A equipe irá discutir as mitigações depois. Cada ameaça deve se relacionar a uma prática de segurança do OWASP SAMM (ex: Análise de Ameaças, Testes de Segurança, Gerenciamento de Defeitos).
    - Crie 2-3 opções que sejam ameaças de segurança plausíveis e relevantes.
    - Crie 1-2 opções que sejam incorretas, sutilmente falhas ou menos prioritárias, mas que pareçam verossímeis para um não especialista.
    - NÃO rotule quais são corretas ou incorretas.
    - Use o formato "Opção A", "Opção B", etc., no seu pensamento, mas o JSON final deve ter apenas o ID e a descrição.

    Retorne a resposta como um objeto JSON com uma única chave "options", que é um array de objetos. Cada objeto deve ter duas chaves: "id" (ex: "A", "B", "C", "D") e "description" (o texto da opção).
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
    
    const jsonString = response.text.trim();
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

    const jsonString = response.text.trim();
    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse.analyzedOptions || !Array.isArray(parsedResponse.analyzedOptions)) {
        throw new Error("Invalid response format from Gemini API for threat analysis.");
    }
    
    return parsedResponse.analyzedOptions;
};