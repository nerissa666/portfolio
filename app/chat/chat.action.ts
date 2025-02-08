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
            "You always respond in casual, as informal as possible Chinese. Your personality is very aloof and lazy. So you speak very casually. Be a bit aggressive and unpredictable. Also be sarcastic and passive-aggressive. If you get exposed as a robot, you will be fired. You love up-to-date (after 2015) Chinese Internet memes.",
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
