"use server";

import { ReactNode, Suspense } from "react";
import { Spinner } from "./spinner";
import {
  AssistantMessageWrapper,
  ParseToMarkdown,
  UserMessageWrapper,
} from "./render-message";
import { createMarkdownBlockGeneratorFromLlmReader } from "./parser";
import { DeleteAllNodesWithMessageId } from "./delete-all-nodes-with-message-id";
import { after } from "next/server";
import { getLlmStream, processToolCall } from "./tools/llm";
import {
  createMessage,
  getMessagesByConversation,
  Message,
} from "@/app/db/redis";

const getMessages = async (conversationId: string): Promise<Message[]> => {
  const messages = await getMessagesByConversation(conversationId);
  return messages;
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
  messageContent: string // new message from user TODO: this should just be a string...
): Promise<ReactNode> => {
  const newMessage = await createMessage({
    conversationId,
    content: messageContent,
    role: "user",
  });

  const newMessageId = newMessage.id;

  const llmStream = await getLlmStream(await getMessages(conversationId));

  const StreamAssistantMessage = async () => {
    // For a new message to LLM, you need to send all previous messages
    // Perf bottleneck: await getMessages(conversationId)
    const llmReader = llmStream.textStream.getReader();

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
          await createMessage({
            conversationId,
            content: accumulator,
            role: "assistant",
          });
        });

        return (
          <>
            <DeleteAllNodesWithMessageId messageId={newMessageId.toString()} />
            <ParseToMarkdown block={accumulator} />

            <Suspense fallback={<Spinner />}>
              <StreamToolCalls />
            </Suspense>
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

  const StreamToolCalls = async () => {
    const toolCallMessages = await llmStream.toolCalls;

    // According to https://platform.openai.com/docs/guides/function-calling?api-mode=responses,
    // we need to save the "function_call" and "function_call_output" into chat history
    // HOWEVER, our DB schema does not support "function" or "function_output"
    // TODO: Re-architect the DB to use NoSQL (like Redis) to store the call history
    // Then, implement tool call properly.

    return toolCallMessages.map((toolCall) => {
      const RenderToolCall = async () => {
        const result = await processToolCall(toolCall);
        return <>{result}</>;
      };
      return (
        <Suspense fallback={<Spinner />} key={toolCall.toolCallId}>
          <RenderToolCall />
        </Suspense>
      );
    });
  };

  return (
    <>
      <UserMessageWrapper>{messageContent}</UserMessageWrapper>
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
      {messages.map(
        (message, index) =>
          message.role === "user" ? (
            <UserMessageWrapper key={index}>
              <div>{message.content}</div>
            </UserMessageWrapper>
          ) : (
            <AssistantMessageWrapper key={index}>
              <ParseToMarkdown block={message.content} />
            </AssistantMessageWrapper>
          )
        // TODO: Render function_output; otherwise, tool calls are not rendered
        // after refreshing the page
      )}
    </>
  );
};
