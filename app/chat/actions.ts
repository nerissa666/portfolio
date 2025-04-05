"use server";

import { LanguageModelV1 } from "ai";

import { deepseek } from "@ai-sdk/deepseek";
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
): Promise<AsyncIterable<string>> => {
  return await getTextStream(messages);
};
