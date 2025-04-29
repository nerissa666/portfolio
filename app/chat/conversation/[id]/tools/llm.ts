import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { TOOLS } from "./tools";
import { Message } from "@/app/db/redis";

export const getLlmStream = async (messages: Message[]) => {
  return await streamText({
    model: openai("gpt-4o"),
    messages: messages as CoreMessage[],
    tools: TOOLS,
  });
};
