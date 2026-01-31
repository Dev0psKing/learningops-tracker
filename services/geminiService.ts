import { GoogleGenAI, Type } from "@google/genai";

// Use the Flash model for speed and efficiency (Free Tier Friendly)
const MODEL_NAME = 'gemini-3-flash-preview';

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
    if (aiClient) return aiClient;

    // SAFEGUARD: Check for API Key presence to prevent crashes if missing
    // Note: In Vite/React, ensure your environment variable is correctly exposed as process.env.API_KEY
    // or use the appropriate bundler replacement.
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;

    if (!apiKey) {
        console.error("API_KEY is missing. AI features will not work.");
        throw new Error("Missing API Key");
    }

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
};

export interface EvaluationResult {
    isCorrect: boolean;
    feedback: string;
}

/**
 * Generates 3 hard technical interview questions for a specific data analytics dimension.
 */
export const generateInterviewQuestions = async (dimension: string): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const prompt = `You are a strict Senior Data Engineer conducting a technical interview.
    Generate 3 distinct, challenging interview questions to test a candidate's expertise in "${dimension}".
    The questions should be conceptual or scenario-based, suitable for a "Strong" candidate.
    Do not ask for code implementation, ask for explanation or approach.
    Return ONLY a JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const text = response.text;
        if (!text) return fallbackQuestions(dimension);

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return fallbackQuestions(dimension);
    }
};

/**
 * Evaluates a user's answer to an interview question.
 */
export const evaluateAnswer = async (question: string, answer: string): Promise<EvaluationResult> => {
    try {
        const ai = getAiClient();
        const prompt = `Question: "${question}"
    Candidate Answer: "${answer}"
    
    Act as a Senior Technical Interviewer. Grade this answer.
    It must be technically accurate and demonstrate depth.
    If the answer is vague, too short, or incorrect, mark it as incorrect.
    Return JSON: { "isCorrect": boolean, "feedback": "One sentence critique." }`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
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

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Grading Error:", error);
        return {
            isCorrect: true,
            feedback: "System offline or API Key missing. Answer accepted provisionally."
        };
    }
};

const fallbackQuestions = (dimension: string) => [
    `Explain the most critical challenges in ${dimension}.`,
    `How do you ensure data quality when performing ${dimension}?`,
    `Describe a time you had to troubleshoot a complex ${dimension} issue.`
];// This service has been deprecated.
// The application now uses a deterministic rules engine for performance feedback.
// You may safely delete this file.
