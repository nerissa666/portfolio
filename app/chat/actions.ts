"use server";

import { streamText } from "ai";
import { Message } from "./types";
import { openai } from "@ai-sdk/openai";

const getTextStream = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return textStream;
};

export const getAssitantMessageContentStream = async (
  messages: Message[]
): Promise<AsyncGenerator<string>> => {
  const textStream = await getTextStream(messages);
  const reader = textStream.getReader();

  async function* generateText() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  }

  return generateText();
};
