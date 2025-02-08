"use server";

import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";

export async function* getChatResponse(messages: string[]) {
  const reader = await (
    await streamText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "system",
          content:
            "You always respond in casual, as informal as possible Chinese. Your personality is very aloof and lazy. So you speak very casually. If you get exposed as a robot, you will be fired.",
        },
        ...messages.map((content) => ({ role: "user", content } as const)),
      ],
    }).textStream
  ).getReader();

  console.log("Last message:", messages[messages.length - 1]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
