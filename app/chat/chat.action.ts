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
  chat: "gpt-4o-mini",
} as const;

const getSystemPrompt = (language: "zh" | "en", mode: ChatMode): string => {
  const basePrompt =
    "To create human-like experience, you must split your response into a few chunks. Each chunk must be separated by exactly one emoji 🔗. For example: 'First chunk🔗Second chunk🔗Third chunk'.";

  const modePrompt =
    mode === "reasoning"
      ? "Focus on clear explanations and logical reasoning. Don't be too verbose."
      : "Be conversational, engaging, and colloquial.";

  return language === "zh"
    ? `无论如何必须使用中文回复. ${basePrompt} ${modePrompt}`
    : `Must reply in English in any case. ${basePrompt} ${modePrompt}`;
};

const selectModelAndMode = async (
  messages: Message[]
): Promise<[string, ChatMode]> => {
  try {
    const lastMessage = messages[messages.length - 1];

    const { object: mode } = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `Choose 'reasoning' or 'chat' model based on the message content:

REASONING for:
- Math/calculations
- Technical questions
- Logic puzzles
- Factual explanations
- Direct questions
- Keywords: calculate, solve, explain, why

CHAT for:
- Open discussions
- Opinions/advice
- Creative content
- Casual conversation
- Keywords: opinion, creative, chat

Analyze:\n"${lastMessage.content}"`,
      output: "enum",
      enum: Object.keys(MODEL_MAP),
    });

    return [MODEL_MAP[mode as keyof typeof MODEL_MAP], mode as ChatMode];
  } catch (error) {
    console.error("Error selecting model, defaulting to gpt-4o-mini:", error);
    return ["gpt-4o-mini", "chat"];
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
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
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
  yield { text: "\u200B", mode: selectedMode, firstChunkOfNewMessage: false };
  let buffer = "";
  let firstChunkOfNewMessage = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Yield any remaining buffer content
      if (buffer) {
        yield {
          text: buffer,
          mode: selectedMode,
          firstChunkOfNewMessage,
        };
      }
      break;
    }

    buffer += value;

    while (buffer.includes("🔗")) {
      // Find the first occurrence of the separator
      const splitIndex = buffer.indexOf("🔗");
      const firstPart = buffer.slice(0, splitIndex);
      const secondPart = buffer.slice(splitIndex + 2); // +2 to skip the emoji and any extra character

      // Yield the first part if it has content
      if (firstPart) {
        yield {
          text: firstPart,
          mode: selectedMode,
          firstChunkOfNewMessage,
        };
        firstChunkOfNewMessage = false;
      }

      // Set flag for the next chunk
      firstChunkOfNewMessage = true;

      // Update buffer with remaining content after removing emoji
      buffer = secondPart.trim();
    }
  }
}
