import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeStory(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下這段生活趣事，並提供一個簡短的標題（10字以內）和一個最適合的分類（從以下選擇：funny, touching, weird, adventure, general）。
      內容：${content}
      
      請以 JSON 格式回傳：{"title": "...", "category": "..."}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
