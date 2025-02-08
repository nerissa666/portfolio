"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";

export async function* getChatResponse(messages: string[]) {
  let model = openai("gpt-4o-mini");
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt:
        "Decide which model should be used to based on the message: " +
        messages[messages.length - 1],
      output: "enum",
      enum: ["reasoning", "serious chat", "casual chat"],
    });

    const modelMap = {
      reasoning: openai("o1-mini"),
      "serious chat": openai("gpt-4o"),
      "casual chat": openai("gpt-4o-mini"),
    };
    model = modelMap[object];
  } catch (error) {
    // Default to gpt-4o-mini if there's an error
    console.error("Error selecting model, defaulting to gpt-4o-mini:", error);
  }

  const reader = await (
    await streamText({
      model,
      messages: [
        {
          role: "system",
          content: "Do not return markdown, just return the text.",
        },
        ...messages.map((content) => ({ role: "user", content } as const)),
      ],
    }).textStream
  ).getReader();

  console.log(
    "Last message:",
    messages[messages.length - 1],
    "Using model:",
    model.modelId
  );

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
