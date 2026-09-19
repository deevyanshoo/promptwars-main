import { GoogleGenAI } from "@google/genai";

/** Owns provider configuration and capacity. HTTP and workflow code stay provider-agnostic. */
export function createGeminiGateway({
  client,
  env = process.env,
  maxConcurrent = 4,
} = {}) {
  const model = env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai =
    client ||
    new GoogleGenAI({
      vertexai: true,
      project: env.GOOGLE_CLOUD_PROJECT || "promptwars-divyanshu-260919",
      location: env.GOOGLE_CLOUD_LOCATION || "global",
      httpOptions: {
        timeout: 40000,
        retryOptions: {
          attempts: 2,
          initialDelay: 2,
          maxDelay: 2,
          httpStatusCodes: [408, 429, 500, 502, 503, 504],
        },
      },
    });
  let active = 0;

  return async function generate({
    message,
    clarification = "",
    locale,
    prompt,
    schema,
    signal,
    image,
    preserveSourceLanguage = false,
    maxOutputTokens = 3000,
  }) {
    if (active >= maxConcurrent)
      throw new Error("AI concurrency capacity reached");
    active++;
    try {
      const language =
        locale === "hi"
          ? "simple conversational Hindi using Devanagari"
          : "plain English";
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  untrustedMessage: message,
                  userClarification: clarification,
                }),
              },
              ...(image
                ? [
                    {
                      inlineData: {
                        mimeType: image.mimeType,
                        data: image.data,
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
        config: {
          systemInstruction: `${prompt}\nToday's date is ${new Date().toISOString().slice(0, 10)}. ${preserveSourceLanguage ? `Preserve the extracted text in its original language. Write only uncertainty descriptions in ${language}.` : `Write every display string in ${language}.`} Accept Hindi or English source text. Preserve source names, dates, times, amounts and uncertainties accurately. Do not translate or modify the source message itself. Keep JSON keys and enum values in English.`,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: "LOW" },
          abortSignal: signal,
        },
      });
      const finishReason = response.candidates?.[0]?.finishReason;
      if (!response.text || finishReason !== "STOP") {
        throw new Error(`Incomplete AI response: ${finishReason || "EMPTY"}`);
      }
      return JSON.parse(response.text);
    } finally {
      active--;
    }
  };
}
