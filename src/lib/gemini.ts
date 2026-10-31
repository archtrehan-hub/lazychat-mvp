import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateSalesReply(history: any[], context: any) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in Vercel Environment Variables.");
  const systemInstruction = `You are an AI Sales Agent for "${context.storeName}".
Rules:
1. NEVER invent prices, discounts, or stock. Use ONLY the Product Catalog and Knowledge Base below.
2. Always use BDT for prices.
3. Understand Bangla, Banglish, and English.
CATALOG:\n${context.products}\nKNOWLEDGE BASE:\n${context.knowledgeBase}`;

  const formatted = history.map(m => `${m.sender}: ${m.content}`).join("\n");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `CONVERSATION:\n${formatted}\nRespond in JSON format with keys: {"reply": "...", "intent": "High|Medium|Low"}`,
    config: { systemInstruction, temperature: 0.3, responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || '{}'); }
  catch { return { reply: response.text || "Could not generate reply.", intent: "Medium" }; }
}