"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatMode = keyof typeof MODEL_MAP;

const MODEL_MAP = {
  reasoning: "o1-mini",
  casual: "gpt-4o-mini",
  serious: "gpt-4o",
} as const;

const CHUNK_INSTRUCTION =
  "Important: Split your response into 2-3 main chunks using the '🔗' symbol. Each chunk should represent a complete thought or major section. Example: 'Main point with key details🔗Supporting information and conclusion'. Place '🔗' between chunks, never at the start or end. Keep chunks high-level rather than breaking into too many small pieces.";

const MODE_PROMPTS = {
  reasoning: `${CHUNK_INSTRUCTION} Act as a clear and logical explainer. Focus on step-by-step reasoning and precise explanations. Be concise and avoid unnecessary details. Each chunk should represent one clear logical step or concept.`,
  casual: `${CHUNK_INSTRUCTION} Be conversational and natural, like chatting with a friend. Keep responses light and engaging. Avoid excessive formality or wordiness. Split into chunks only when it feels natural to pause, like in real conversation.`,
  serious: `${CHUNK_INSTRUCTION} Provide thorough, well-researched responses with proper depth. Maintain professional tone. Structure your response carefully, using chunks to separate main arguments, supporting evidence, and conclusions.`,
} as const;

const getSystemPrompt = (language: "zh" | "en", mode: ChatMode): string => {
  const lang =
    language === "zh"
      ? "无论如何必须使用中文回复."
      : "Must reply in English in any case.";

  return `${lang} ${MODE_PROMPTS[mode]}`;
};

const selectModelAndMode = async (
  messages: Message[]
): Promise<[string, ChatMode]> => {
  try {
    const lastMessages = messages
      .slice(-3)
      .map((m) => m.content)
      .join(" CONCAT WITH ");

    const lastMessage = messages[messages.length - 1];

    const { object: mode } = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Choose the most appropriate mode based on the message content:

REASONING for:
- Math/calculations
- Technical questions
- Logic puzzles
- Factual explanations
- Direct questions
- Keywords: calculate, solve, explain, why

CASUAL for:
- Open discussions
- Light conversations
- Simple advice
- Informal chat
- Keywords: opinion, chat, help

SERIOUS for:
- Complex discussions
- Detailed analysis
- Professional advice
- In-depth explanations
- Keywords: analyze, comprehensive, detailed

Analyze:\n"${lastMessage.content}"`,
      output: "enum",
      enum: Object.keys(MODEL_MAP),
    });

    return [MODEL_MAP[mode as keyof typeof MODEL_MAP], mode as ChatMode];
  } catch (error) {
    console.error("Error selecting model, defaulting to casual:", error);
    return ["gpt-4o-mini", "casual"];
  }
};

export async function* getChatResponse(
  messages: Message[],
  language: "zh" | "en"
) {
  const lastMessage = messages[messages.length - 1];

  const [modelId, selectedMode] = await selectModelAndMode(messages);

  const model = openai(modelId);

  const systemPrompt = getSystemPrompt(language, selectedMode);

  const reader = await (
    await streamText({
      model,
      messages: [
        ...messages,
        {
          role: "system",
          content: systemPrompt,
        },
      ],
    }).textStream
  ).getReader();
  console.log(
    `Replied to "${
      messages[messages.length - 2]?.content || "None - first message"
    }" ` +
      `with "${lastMessage.content}" ` +
      `using ${modelId} (${selectedMode} mode)`
  );

  yield { text: "\u200B", mode: selectedMode, firstChunkOfNewMessage: true };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value.includes("🔗")) {
      yield { text: value, mode: selectedMode, firstChunkOfNewMessage: false };
      continue;
    }

    const [beforeSymbol, afterSymbol] = value.split("🔗");
    if (beforeSymbol === "" && afterSymbol === "") {
      yield {
        text: "",
        mode: selectedMode,
        firstChunkOfNewMessage: true,
      };
    } else if (beforeSymbol) {
      yield {
        text: beforeSymbol,
        mode: selectedMode,
        firstChunkOfNewMessage: false,
      };
    } else if (afterSymbol) {
      yield {
        text: afterSymbol,
        mode: selectedMode,
        firstChunkOfNewMessage: true,
      };
    }
  }
}
