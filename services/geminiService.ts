import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURATION ---
const GEMINI_MODEL = 'gemini-3-flash-preview'; // Fast, cheap/free
const GROQ_MODEL = 'llama3-70b-8192'; // Excellent fallback

// --- API KEY MANAGEMENT ---
const getApiKey = (keyName: string): string | undefined => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            return import.meta.env[keyName];
        }
    } catch (e) {}

    if (typeof process !== 'undefined') {
        return process.env[keyName];
    }
    return undefined;
};

// --- CLIENT INITIALIZATION ---
let geminiClient: GoogleGenAI | null = null;

const getGeminiClient = () => {
    if (geminiClient) return geminiClient;
    const key = getApiKey('VITE_API_KEY') || getApiKey('API_KEY');
    if (key) {
        geminiClient = new GoogleGenAI({ apiKey: key });
    }
    return geminiClient;
};

const getGroqKey = () => getApiKey('VITE_GROQ_API_KEY') || getApiKey('GROQ_API_KEY');

/**
 * Checks system health.
 */
export const getAiStatus = (): 'gemini' | 'groq' | 'both' | 'none' => {
    const g = !!getGeminiClient();
    const q = !!getGroqKey();
    if (g && q) return 'both';
    if (g) return 'gemini';
    if (q) return 'groq';
    return 'none';
};

export const hasApiKey = (): boolean => getAiStatus() !== 'none';

// --- TYPES ---
export interface EvaluationResult {
    isCorrect: boolean;
    feedback: string;
}

export interface GeneratedFlashcard {
    front: string;
    back: string;
    tags: string[];
}

export interface PerformanceAnalysis {
    velocityScore: number;
    burnoutRisk: 'Low' | 'Moderate' | 'High';
    engagementLevel: string;
    strengths: string[];
    weaknesses: string[];
    strategicAdvice: string;
    actionItems: string[];
}

// --- HELPER: Clean Error Messages ---
const cleanErrorMessage = (error: any): string => {
    const msg = error?.message || String(error);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
        return "Rate Limit Hit"; // Signal for fallback
    }
    return msg;
};

// --- GROQ IMPLEMENTATION (FETCH FALLBACK) ---
const callGroq = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const apiKey = getGroqKey();
    if (!apiKey) throw new Error("Groq API Key missing");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: systemPrompt + " RETURN JSON ONLY." },
                { role: "user", content: userPrompt }
            ],
            model: GROQ_MODEL,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "{}";
};

// --- UNIFIED GENERATION RUNNER ---
// Tries Gemini -> Falls back to Groq -> Falls back to Mock
const generateWithFallback = async <T>(
    geminiCall: (ai: GoogleGenAI) => Promise<string>,
    groqSystemPrompt: string,
    groqUserPrompt: string,
    mockData: T
): Promise<T> => {

    // 1. Try Gemini
    const ai = getGeminiClient();
    let geminiError = null;

    if (ai) {
        try {
            const text = await geminiCall(ai);
            return JSON.parse(text) as T;
        } catch (error: any) {
            geminiError = error;
            const cleanMsg = cleanErrorMessage(error);

            // If it's not a rate limit/fetch error (e.g. strict safety filter), we might still want to try Groq
            console.warn(`Gemini Failed (${cleanMsg}). Attempting Fallback...`);
        }
    }

    // 2. Try Groq
    if (getGroqKey()) {
        try {
            const jsonStr = await callGroq(groqSystemPrompt, groqUserPrompt);
            return JSON.parse(jsonStr) as T;
        } catch (error) {
            console.error("Groq Fallback Failed:", error);
        }
    }

    // 3. Mock Fallback (Safety Net)
    console.warn("All AI providers failed. Using Mock Data.");
    if (geminiError) console.error("Original Error:", geminiError);

    // Artificial delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockData;
};

// --- EXPORTED FUNCTIONS ---

export const generateInterviewQuestions = async (dimension: string): Promise<string[]> => {
    const systemPrompt = `You are a strict Senior Data Engineer. Generate 3 distinct, challenging interview questions for "${dimension}". Return strictly a JSON object with a 'questions' key (array of strings).`;

    // Fix: Wrapped return type in object to match Gemini Schema
    const result = await generateWithFallback<{ questions: string[] }>(
        async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: systemPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return response.text || "{}";
        },
        systemPrompt,
        `Topic: ${dimension}`,
        {
            questions: [
                `[Offline Mode] Explain the difference between inner and outer joins in the context of ${dimension}.`,
                `[Offline Mode] How would you handle missing data anomalies when performing ${dimension}?`,
                `[Offline Mode] Describe a scenario where ${dimension} fails to provide actionable insights.`
            ]
        }
    );

    return result.questions || [];
};

export const evaluateAnswer = async (question: string, answer: string): Promise<EvaluationResult> => {
    const systemPrompt = `Act as a Senior Technical Interviewer. Grade this answer. It must be technically accurate. Return JSON: { "isCorrect": boolean, "feedback": "One sentence critique." }`;
    const userPrompt = `Question: "${question}"\nCandidate Answer: "${answer}"`;

    return generateWithFallback(
        async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            isCorrect: { type: Type.BOOLEAN },
                            feedback: { type: Type.STRING }
                        },
                        required: ["isCorrect", "feedback"]
                    }
                }
            });
            return response.text || "{}";
        },
        systemPrompt,
        userPrompt,
        {
            isCorrect: true,
            feedback: "[Offline Mode] Unable to connect to AI. Answer accepted provisionally."
        }
    );
};

export const generateFlashcards = async (topic: string): Promise<GeneratedFlashcard[]> => {
    const systemPrompt = `Create 3 high-quality flashcards for: "${topic}". Front: Concept/Question. Back: Concise Answer. Tags: Array of strings. Return JSON object with 'flashcards' key.`;

    const result = await generateWithFallback<{ flashcards: GeneratedFlashcard[] }>(
        async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: `Topic: ${topic}`,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            flashcards: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        front: { type: Type.STRING },
                                        back: { type: Type.STRING },
                                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["front", "back", "tags"]
                                }
                            }
                        }
                    }
                }
            });
            return response.text || "{}";
        },
        systemPrompt,
        `Topic: ${topic}`,
        { flashcards: [] }
    );

    return result.flashcards || [];
};

export const generatePerformanceAnalysis = async (userData: any): Promise<PerformanceAnalysis> => {
    const systemPrompt = `Act as a Senior Engineering Manager. Analyze the provided JSON data. Provide a brutal but constructive review. Return strictly JSON matching the schema: { velocityScore: number, burnoutRisk: 'Low'|'Moderate'|'High', engagementLevel: string, strengths: string[], weaknesses: string[], strategicAdvice: string, actionItems: string[] }.`;
    const userPrompt = `Data: ${JSON.stringify(userData)}`;

    return generateWithFallback(
        async (ai) => {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: userPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            velocityScore: { type: Type.NUMBER },
                            burnoutRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                            engagementLevel: { type: Type.STRING },
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                            strategicAdvice: { type: Type.STRING },
                            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["velocityScore", "burnoutRisk", "strengths", "weaknesses", "strategicAdvice", "actionItems"]
                    }
                }
            });
            return response.text || "{}";
        },
        systemPrompt,
        userPrompt,
        {
            velocityScore: 0,
            burnoutRisk: 'Low',
            engagementLevel: 'Offline',
            strengths: ['Data unavailable'],
            weaknesses: ['Data unavailable'],
            strategicAdvice: 'AI Service Offline. Please check API Key configuration.',
            actionItems: ['Retry later']
        }
    );
};
