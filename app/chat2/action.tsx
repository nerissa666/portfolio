"use server";

import { LanguageModelV1, streamText } from "ai";
import { Message } from "./types";
import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { Suspense } from "react";
import { WithIncreaseFontSize } from "./client-button";

const getTextStreamFromChatgpt = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return textStream;
};

const getTextStreamFromDeepseek = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: deepseek("deepseek-chat") as LanguageModelV1,
    messages,
  });

  return textStream;
};

const getTextStream =
  process.env.NODE_ENV === "development"
    ? getTextStreamFromDeepseek
    : getTextStreamFromChatgpt;

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

export const getMessageReactNode = async (message: Message) => {
  return (
    <WithIncreaseFontSize>
      <Suspense fallback={<div>Loading...</div>}>
        <StreamableDeepseekReply message={message} />
      </Suspense>
    </WithIncreaseFontSize>
  );
};

const StreamableDeepseekReply = async ({ message }: { message: Message }) => {
  return (
    <StreamableRenderFromAsyncGenerator
      g={await getAssitantMessageContentStream([message])}
    />
  );
};

const StreamableRenderFromAsyncGenerator = async ({
  g,
}: {
  g: AsyncGenerator<string>;
}) => {
  const { done, value } = await g.next();
  if (done) return <>{value}</>;
  return (
    <>
      {value}
      <Suspense fallback={<div>...</div>}>
        <StreamableRenderFromAsyncGenerator g={g} />
      </Suspense>
    </>
  );
};
