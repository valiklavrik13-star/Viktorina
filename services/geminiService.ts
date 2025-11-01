
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const quizGenerationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            questionText: {
                type: Type.STRING,
                description: "The text of the quiz question.",
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers. One must be correct.",
            },
            correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The 0-based index of the correct answer in the 'options' array.",
            },
        },
        required: ["questionText", "options", "correctAnswerIndex"],
    },
};

export const generateQuizQuestions = async (prompt: string, questionCount: number): Promise<Omit<Question, 'id' | 'image'>[]> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }
    
    const fullPrompt = `Generate ${questionCount} quiz questions based on the following topic: "${prompt}". Each question must have exactly 4 options. Ensure one option is correct and provide its index.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizGenerationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const generatedQuestions = JSON.parse(jsonText);
        
        // Validate the structure
        if (!Array.isArray(generatedQuestions)) {
            throw new Error("AI response is not an array.");
        }

        return generatedQuestions.map((q: any) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
        }));

    } catch (error) {
        console.error("Error generating quiz questions with Gemini:", error);
        throw new Error("Failed to generate questions. Please check the prompt or try again later.");
    }
};
