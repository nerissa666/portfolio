import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { TOOLS } from "./supported-tools/tools";
import { getUserInformation, Message } from "@/app/db/redis";

export const getLlmStream = async (messages: Message[]) => {
  const userInformation = (await getUserInformation()).join(" ");

  return await streamText({
    model: openai("gpt-4.1-mini"),
    messages: [
      {
        role: "system",
        content: `Prefer calling tools over guessing. For example, do not guess today's date, use [webSearch] to find it.`,
      },
      {
        role: "system",
        content: `Here is some information we learned about the user: ${userInformation}`,
      },
      {
        role: "system",
        content: `Today's date is ${new Date().toLocaleDateString()}`,
      },
      ...messages,
    ] as CoreMessage[],
    tools: TOOLS,
  });
};
