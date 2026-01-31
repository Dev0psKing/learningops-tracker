import { GoogleGenAI, Type } from "@google/genai";

// Use the Flash model for speed and efficiency (Free Tier Friendly)
const MODEL_NAME = 'gemini-3-flash-preview';

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
    if (aiClient) return aiClient;

    // SAFEGUARD: Check for API Key in multiple common locations
    // 1. Vite / Modern Frontend (import.meta.env.VITE_API_KEY)
    // 2. Standard Node/System (process.env.API_KEY)

    let apiKey: string | undefined = undefined;

    try {
        // @ts-ignore - Handle Vite context safely
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            apiKey = import.meta.env.VITE_API_KEY;
        }
    } catch (e) {
        // Ignore error if import.meta is not defined
    }

    if (!apiKey && typeof process !== 'undefined') {
        apiKey = process.env.API_KEY;
    }

    if (!apiKey) {
        console.warn("API Key not found in VITE_API_KEY or process.env.API_KEY. Switching to Demo/Mock mode.");
        return null;
    }

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
};

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

/**
 * Generates 3 hard technical interview questions for a specific data analytics dimension.
 */
export const generateInterviewQuestions = async (dimension: string): Promise<string[]> => {
    const ai = getAiClient();

    // --- MOCK MODE ---
    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
        return [
            `[Demo] Explain the difference between inner and outer joins in the context of ${dimension}.`,
            `[Demo] How would you handle missing data anomalies when performing ${dimension}?`,
            `[Demo] Describe a scenario where ${dimension} fails to provide actionable insights.`
        ];
    }

    try {
        const prompt = `You are a strict Senior Data Engineer conducting a technical interview.
    Generate 3 distinct, challenging interview questions to test a candidate's expertise in "${dimension}".
    The questions should be conceptual or scenario-based, suitable for a "Strong" candidate.
    Return a JSON object with a 'questions' key containing an array of strings.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        const json = JSON.parse(text);
        return json.questions || fallbackQuestions(dimension);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return fallbackQuestions(dimension);
    }
};

/**
 * Evaluates a user's answer to an interview question.
 */
export const evaluateAnswer = async (question: string, answer: string): Promise<EvaluationResult> => {
    const ai = getAiClient();

    // --- MOCK MODE ---
    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const isPass = answer.length > 20; // Simple length check for demo
        return {
            isCorrect: isPass,
            feedback: isPass
                ? "[Demo] Good job! Your answer covers the core concepts. In a real interview, be more specific about edge cases."
                : "[Demo] The answer is too brief. Please elaborate on the technical implementation details."
        };
    }

    try {
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
            feedback: "System offline. Answer accepted provisionally."
        };
    }
};

/**
 * Generates flashcards based on a topic or text.
 */
export const generateFlashcards = async (topic: string): Promise<GeneratedFlashcard[]> => {
    const ai = getAiClient();

    // --- MOCK MODE ---
    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [
            {
                front: `[Demo] What is the primary purpose of ${topic}?`,
                back: `This is a simulated flashcard for ${topic}. In a real app, this would be a definition generated by Gemini.`,
                tags: ["Demo", "Concept"]
            },
            {
                front: `[Demo] Explain a common pitfall when using ${topic}.`,
                back: "Simulated answer: Overusing it without understanding the performance implications.",
                tags: ["Demo", "Best Practice"]
            },
            {
                front: `[Demo] Compare ${topic} with its nearest alternative.`,
                back: "Simulated answer: It offers better scalability but higher complexity.",
                tags: ["Demo", "Comparison"]
            }
        ];
    }

    try {
        const prompt = `Create 3 high-quality flashcards for the topic: "${topic}".
    The 'front' should be a concept question or term.
    The 'back' should be a concise, clear explanation.
    Include 1-2 relevant tags.
    Return a JSON object with a 'flashcards' key containing the array.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
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

        const text = response.text;
        if (!text) throw new Error("No response");

        const json = JSON.parse(text);
        return json.flashcards || [];
    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        throw error;
    }
};

/**
 * Analyzes user performance data to generate a managerial report.
 */
export const generatePerformanceAnalysis = async (userData: any): Promise<PerformanceAnalysis> => {
    const ai = getAiClient();

    // --- MOCK MODE ---
    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const isGood = userData.totalStudyHours > 10;
        return {
            velocityScore: isGood ? 88 : 45,
            burnoutRisk: isGood ? 'Moderate' : 'Low',
            engagementLevel: isGood ? 'High' : 'Low',
            strengths: ['Consistency in logs', 'Detailed documentation', 'Curiosity'],
            weaknesses: ['Late submissions', 'Lack of deep dives', 'Skipping hard topics'],
            strategicAdvice: isGood
                ? "[Demo] You are performing well. Focus on deepening your understanding of the core concepts rather than just covering ground."
                : "[Demo] Velocity is currently below baseline. I recommend blocking out 2 hours every morning to get back on track.",
            actionItems: ['Complete 3 pending reviews', 'Refactor the SQL module', 'Update your journal']
        };
    }

    try {
        const prompt = `
      Act as a Senior Engineering Manager reviewing a Junior Data Engineer's progress.
      Analyze this data JSON: ${JSON.stringify(userData)}.
      
      Provide a brutal but constructive performance review.
      1. Calculate a Velocity Score (0-100) based on hours and tasks.
      2. Assess Burnout Risk based on consistency and recent hours.
      3. Identify 3 specific Technical Strengths.
      4. Identify 3 specific Weaknesses or Gaps.
      5. Write a "Strategic Advice" paragraph (approx 50 words) like a manager speaking to a direct report.
      6. List 3 specific Action Items for next week.
      
      Return strictly JSON matching the schema.
    `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
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

        const text = response.text;
        if (!text) throw new Error("No response");

        return JSON.parse(text);
    } catch (error) {
        console.error("Performance Analysis Error:", error);
        return {
            velocityScore: 0,
            burnoutRisk: 'Low',
            engagementLevel: 'Unknown',
            strengths: ['Data unavailable'],
            weaknesses: ['Data unavailable'],
            strategicAdvice: 'AI Service Error. Please check API Key configuration.',
            actionItems: ['Retry later']
        };
    }
};

const fallbackQuestions = (dimension: string) => [
    `Explain the most critical challenges in ${dimension}.`,
    `How do you ensure data quality when performing ${dimension}?`,
    `Describe a time you had to troubleshoot a complex ${dimension} issue.`
];
