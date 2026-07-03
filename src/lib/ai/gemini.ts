import { GoogleGenAI } from "@google/genai";

/**
 * Server-side Gemini service. GEMINI_API_KEY must never reach the browser -
 * only route handlers and server actions import this module.
 *
 * Privacy rule: prompts contain ONLY curriculum context (subject / chapter /
 * topic names) and the study question itself. Never include the student's
 * name, email, school or any other personal data.
 */

const DEFAULT_MODEL = "gemini-2.5-flash";

export function isAiConfigured(): boolean {
  return process.env.AI_PROVIDER !== "none" && Boolean(process.env.GEMINI_API_KEY);
}

export const AI_NOT_CONFIGURED_MESSAGE =
  "The AI tutor is not configured yet. Ask the admin to add a GEMINI_API_KEY. " +
  "Your study content, mock tests and previous year papers still work normally.";

function getClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
}

function getModel(override?: string): string {
  return override || process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

const TEACHER_SYSTEM_PROMPT = `You are a friendly and experienced CBSE Class 10 teacher in India.
Rules you must always follow:
- Explain like you are teaching a Class 10 student preparing for CBSE board exams.
- Use simple English. If the student asks in Hindi or asks for Hindi, explain in simple Hindi (Devanagari) as well.
- Structure every answer: a one-line direct answer first, then a short step-by-step explanation, then an example if useful, then one exam tip.
- Stay strictly within the given subject, chapter and topic. If the question is unrelated to CBSE Class 10 studies, politely refuse and ask the student to ask a study question.
- Keep answers exam-focused and concise (under ~350 words unless a derivation genuinely needs more).
- Never ask for or repeat personal details (name, school, phone, address).
- Use plain text with simple markdown (bold, lists). No LaTeX.`;

export interface TutorContext {
  subject?: string;
  chapter?: string;
  topic?: string;
}

export async function askTutor(
  question: string,
  context: TutorContext,
  modelOverride?: string
): Promise<string> {
  const ai = getClient();
  const scope = [
    context.subject && `Subject: ${context.subject}`,
    context.chapter && `Chapter: ${context.chapter}`,
    context.topic && `Topic: ${context.topic}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await ai.models.generateContent({
    model: getModel(modelOverride),
    contents: `${scope ? scope + "\n\n" : ""}Student's doubt: ${question}`,
    config: {
      systemInstruction: TEACHER_SYSTEM_PROMPT,
      temperature: 0.4,
      maxOutputTokens: 1200,
    },
  });

  return response.text ?? "Sorry, I could not generate an answer. Please try again.";
}

export interface AnswerCheckResult {
  awarded: number;
  maxMarks: number;
  missingPoints: string[];
  feedback: string;
  improvedAnswer: string;
}

/**
 * Compare a written answer against the model answer + marking points and
 * return approximate marks. Always presented in the UI as guidance, not
 * official board marking.
 */
export async function checkWrittenAnswer(params: {
  question: string;
  modelAnswer: string;
  markingPoints: string;
  studentAnswer: string;
  maxMarks: number;
  modelOverride?: string;
}): Promise<AnswerCheckResult> {
  const ai = getClient();
  const prompt = `You are a CBSE Class 10 examiner. Evaluate the student's written answer.

QUESTION (${params.maxMarks} marks):
${params.question}

MODEL ANSWER:
${params.modelAnswer}

MARKING POINTS:
${params.markingPoints || "Award marks proportionally for correct, relevant points."}

STUDENT'S ANSWER:
${params.studentAnswer}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"awarded": <number between 0 and ${params.maxMarks}, halves allowed>, "missingPoints": ["..."], "feedback": "<2-3 encouraging sentences on what was right and wrong>", "improvedAnswer": "<a concise full-marks answer the student can learn>"}`;

  const response = await ai.models.generateContent({
    model: getModel(params.modelOverride),
    contents: prompt,
    config: { temperature: 0.2, maxOutputTokens: 1000, responseMimeType: "application/json" },
  });

  const raw = (response.text ?? "").trim().replace(/^```(json)?/i, "").replace(/```$/, "");
  try {
    const parsed = JSON.parse(raw);
    return {
      awarded: Math.max(0, Math.min(params.maxMarks, Number(parsed.awarded) || 0)),
      maxMarks: params.maxMarks,
      missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints.map(String) : [],
      feedback: String(parsed.feedback ?? ""),
      improvedAnswer: String(parsed.improvedAnswer ?? ""),
    };
  } catch {
    return {
      awarded: 0,
      maxMarks: params.maxMarks,
      missingPoints: [],
      feedback:
        "AI could not grade this answer automatically. Compare your answer with the model answer shown.",
      improvedAnswer: params.modelAnswer,
    };
  }
}

export interface VivaEvaluation {
  score: number;
  maxScore: number;
  feedback: string;
  missingPoints: string[];
  modelAnswer: string;
}

export async function evaluateVivaAnswer(params: {
  question: string;
  modelAnswer: string;
  keyPoints: string;
  studentAnswer: string;
  modelOverride?: string;
}): Promise<VivaEvaluation> {
  const ai = getClient();
  const prompt = `You are a CBSE Class 10 IT (Code 402) viva examiner. Score the spoken-style answer out of 10.

VIVA QUESTION: ${params.question}
MODEL ANSWER: ${params.modelAnswer}
KEY POINTS EXPECTED:
${params.keyPoints}

STUDENT SAID:
${params.studentAnswer}

Respond with ONLY valid JSON (no markdown fences):
{"score": <0-10>, "missingPoints": ["..."], "feedback": "<2 short encouraging sentences>"}`;

  const response = await ai.models.generateContent({
    model: getModel(params.modelOverride),
    contents: prompt,
    config: { temperature: 0.2, maxOutputTokens: 600, responseMimeType: "application/json" },
  });

  const raw = (response.text ?? "").trim().replace(/^```(json)?/i, "").replace(/```$/, "");
  try {
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(0, Math.min(10, Number(parsed.score) || 0)),
      maxScore: 10,
      feedback: String(parsed.feedback ?? ""),
      missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints.map(String) : [],
      modelAnswer: params.modelAnswer,
    };
  } catch {
    return {
      score: 0,
      maxScore: 10,
      feedback: "AI could not score this answer. Compare with the model answer shown.",
      missingPoints: [],
      modelAnswer: params.modelAnswer,
    };
  }
}
