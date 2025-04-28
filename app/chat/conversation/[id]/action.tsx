"use server";

import { streamText } from "ai";
import { Message } from "../../types";
import { openai } from "@ai-sdk/openai";
import { ReactNode, Suspense } from "react";
import prisma from "@/app/db/prisma";
import { Spinner } from "./spinner";
import {
  AssistantMessageWrapper,
  ParseToMarkdown,
  UserMessageWrapper,
} from "./render-message";
import { createMarkdownBlockGeneratorFromLlmReader } from "./parser";
import { DeleteAllNodesWithMessageId } from "./delete-all-nodes-with-message-id";
import { after } from "next/server";

////////// data source
const getLlmTextStream = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return textStream;
};

const getMessages = async (conversationId: string): Promise<Message[]> => {
  // TODO: add a Redis caching here to boost perf
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
  return messages.map((msg) => {
    if (msg.role !== "user" && msg.role !== "assistant") {
      throw new Error(`Invalid role: ${msg.role}`);
    }
    return {
      role: msg.role,
      content: msg.content,
    };
  });
};

const addMessage = async (conversationId: string, message: Message) => {
  await prisma.message.create({
    data: {
      role: message.role,
      content: message.content,
      conversationId,
    },
  });
};

//////////
/**
 * Client appends a new user message for a specific conversation.
 * Server sends the chat history + the new message to the LLM.
 *
 * This action returns new messages back to client in a streamable fashion:
 * 1. It immediately returns a new user message, reiterating the received message.
 * 2. It then streams the LLM response, appending to the response buffer.
 */
export const getMessageReactNode = async (
  conversationId: string,
  message: Message // new message from user
): Promise<ReactNode> => {
  const StreamAssistantMessage = async () => {
    const newMessageId = crypto.randomUUID();

    // For a new message to LLM, you need to send all previous messages
    // Perf bottleneck: await getMessages(conversationId)
    const llmReader = (
      await getLlmTextStream(
        (await getMessages(conversationId)).concat(message)
      )
    ).getReader();

    // wait until the llmReader outputs a newline
    // we define the parts separated by newlines as "blocks"
    // this is like a transform stream that converts the
    // LLM stream into a stream of blocks
    const generateBlocks = createMarkdownBlockGeneratorFromLlmReader(llmReader);

    const StreamableParse = async ({
      accumulator = "",
    }: {
      accumulator?: string;
    }) => {
      const { done, value: block } = await generateBlocks.next();
      if (done) {
        after(async () => {
          await addMessage(conversationId, message);

          await prisma.message.create({
            data: {
              role: "assistant",
              content: accumulator,
              conversationId,
            },
          });
        });

        return (
          <>
            <DeleteAllNodesWithMessageId messageId={newMessageId.toString()} />
            <ParseToMarkdown block={accumulator} />
          </>
        );
      }

      return (
        <>
          <ParseToMarkdown
            data-message-id={newMessageId.toString()}
            block={block}
          />
          <Suspense
            fallback={
              <>
                <Spinner />
                <div className="h-12"></div>
              </>
            }
          >
            <StreamableParse accumulator={accumulator + "\n" + block} />
          </Suspense>
        </>
      );
    };

    return <StreamableParse />;
  };

  return (
    <>
      <UserMessageWrapper>{message.content}</UserMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={<Spinner />}>
          <StreamAssistantMessage />
        </Suspense>
      </AssistantMessageWrapper>
    </>
  );
};

export const getInitialMessagesReactNode = async (
  conversationId: string
): Promise<ReactNode> => {
  const messages = await getMessages(conversationId);
  return (
    <>
      {messages.map((message, index) =>
        message.role === "user" ? (
          <UserMessageWrapper key={index}>
            <div>{message.content}</div>
          </UserMessageWrapper>
        ) : (
          <AssistantMessageWrapper key={index}>
            <ParseToMarkdown block={message.content} />
          </AssistantMessageWrapper>
        )
      )}
    </>
  );
};
