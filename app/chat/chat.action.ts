"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";

type Message = {
  role: "system" | "user" | "assistant" | "data";
  content: string;
};

type ChatMode =
  | "deep reasoning"
  | "some reasoning"
  | "serious chat"
  | "casual chat";

const MODEL_MAP = {
  "deep reasoning": "o1-mini",
  "some reasoning": "gpt-4o",
  "serious chat": "gpt-4-turbo",
  "casual chat": "gpt-4o-mini",
} as const;

const getSystemPrompt = (language: "zh" | "en"): string => {
  const prompt = "Be informal & concise.";

  return language === "zh"
    ? `You must speak Chinese. ${prompt}`
    : `You must speak English. ${prompt}`;
};

const selectModelAndMode = async (
  message: string
): Promise<[string, ChatMode]> => {
  const wordCount = message.trim().split(/\s+/).length;

  if (wordCount <= 2) {
    return ["gpt-4-turbo", "casual chat"];
  }

  try {
    const { object: mode } = await generateObject({
      model: openai("gpt-4-turbo"),
      prompt: `Decide which model should be used to based on the message: [${message}]`,
      output: "enum",
      enum: Object.keys(MODEL_MAP),
    });

    return [MODEL_MAP[mode as ChatMode], mode as ChatMode];
  } catch (error) {
    console.error("Error selecting model, defaulting to gpt-4o-mini:", error);
    return ["gpt-4o-mini", "casual chat"];
  }
};

export async function* getChatResponse(
  messages: Message[],
  language: "zh" | "en"
) {
  const lastMessage = messages[messages.length - 1];

  const [modelId, selectedMode] = await selectModelAndMode(
    messages
      .filter((msg) => msg.role === "user")
      .slice(-10)
      .map((msg) => msg.content)
      .join("->")
  );

  const model = openai(modelId);

  const reader = await (
    await streamText({
      model,
      messages: [
        {
          role: "system",
          content: getSystemPrompt(language),
        },
        ...messages,
      ],
    }).textStream
  ).getReader();

  console.log(
    `Replied to "${
      messages[messages.length - 2]?.content || "None - first message"
    }" ` +
      `with "${lastMessage}" ` +
      `using ${modelId} (${selectedMode} mode)`
  );

  yield { text: "\u200B", mode: selectedMode };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield { text: value, mode: selectedMode };
  }
}
