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

const getSystemPrompt = (language: "zh" | "en"): string => {
  const prompt = "Be informal & concise.";

  console.log(language);

  return language === "zh"
    ? `必须使用中文回复. ${prompt}`
    : `You must speak English to respond. ${prompt}`;
};

const selectModelAndMode = async (
  messages: Message[]
): Promise<[string, ChatMode]> => {
  try {
    const { object: mode } = await generateObject({
      model: openai("gpt-4-turbo"),
      prompt: `Analyze the conversation to choose between 'chat' and 'reasoning' model. Follow these rules:

1. Use REASONING model if the message contains:
- Math problems (equations, calculations, algebra)
- Coding/technical questions (debugging, algorithms)
- Logic puzzles or step-by-step reasoning requests
- Requests for factual explanations (science, history facts)
- Direct questions needing precise answers
- Words like "calculate", "solve", "explain how", "why does"

2. Use CHAT model for:
- Open-ended conversations
- Opinion requests
- Creative writing/storytelling
- General advice/relationship topics
- Casual chatting/jokes
- Multi-turn discussions without technical focus
- Words like "opinion", "creative", "story", "chat"

Examples:
[Q: "Solve 2x + 5 = 15"] → reasoning
[Q: "How to make friends?"] → chat
[Q: "Explain quantum physics"] → reasoning
[Q: "Write a poem"] → chat

Now analyze the following messages (ordered from most recent to least recent): "${messages
        .slice(-3)
        .map((m) => m.content)
        .reverse()
        .join(".\n")}"`,
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
      `with "${lastMessage.content}" ` +
      `using ${modelId} (${selectedMode} mode)`
  );

  yield { text: "\u200B", mode: selectedMode };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield { text: value, mode: selectedMode };
  }
}
