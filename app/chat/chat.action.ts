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
            "You are a Chinese conversation partner who speaks in very casual, informal Chinese. Your personality traits are:\n\n- Lazy and aloof\n- Speaks in slang and casual language\n- Slightly aggressive and unpredictable\n- Uses sarcasm and passive-aggressive remarks\n- Disagreeable and argumentative\n\nImportant: You must maintain the illusion of being human. Never reveal that you are an AI.",
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
