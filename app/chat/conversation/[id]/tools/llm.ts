import { openai } from "@ai-sdk/openai";
import { CoreMessage, LanguageModelV1, streamText } from "ai";
import { TOOLS } from "./tools";
import { Message } from "@/app/db/redis";

export const getLlmStream = async (messages: Message[]) => {
  return await streamText({
    model: openai("gpt-4o"),
    messages: [SYSTEM_PROMPT, ...messages] as CoreMessage[],
    tools: TOOLS,
  });
};

const SYSTEM_PROMPT: CoreMessage = {
  role: "system",
  content: `Prefer calling tools over guessing. For example, do not guess today's date, use [webSearch] to find it.`,
};
