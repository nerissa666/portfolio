import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { TOOLS } from "./supported-tools/tools";
import { getUserInformation, Message } from "@/app/db/redis";

export const getLlmStream = async (messages: Message[]) => {
  const userInformation = (await getUserInformation()).join(" ");

  return await streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a helpful AI assistant with access to various tools. Follow these guidelines:
        1. Always use available tools instead of making assumptions or guesses
        2. For time-sensitive information like dates, use [webSearch] to get accurate data
        3. Be precise and factual in your responses
        4. If you're unsure about something, use the appropriate tool to verify information
        5. Maintain a professional and helpful tone while being concise
        6. For LaTex, use $...$ to render inline and $$...$$ to render block, do not use square brackets if possible.`,
      },
      {
        role: "system",
        content: `User Context: ${
          userInformation || "No specific user information available"
        }`,
      },
      {
        role: "system",
        content: `Current Date: ${new Date().toLocaleDateString()}`,
      },
      ...messages,
    ] as CoreMessage[],
    tools: TOOLS,
  });
};
