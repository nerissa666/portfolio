"use server";

import { streamText } from "ai";
import { Message } from "../types";
import { openai } from "@ai-sdk/openai";
import { ReactNode, Suspense } from "react";
import { compiler } from "markdown-to-jsx";
import prisma from "@/app/db/prisma";

const getTextStream = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return textStream;
};

const getMessages = async (conversationId: string): Promise<Message[]> => {
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

export const getMessageReactNode = async (
  conversationId: string,
  message: Message
): Promise<ReactNode> => {
  await addMessage(conversationId, message);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        <div>{message.content}</div>
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        <Suspense fallback={<Spinner />}>
          <GenerateAssistantReply conversationId={conversationId} />
        </Suspense>
      </div>
    </div>
  );
};

// A new block is typically separated by a newline, unless
// it's inside a code block, in which case the whole code block
// is considered a single block.
// This function yields a single block at a time from the AI's response.
const generateBlocksForMarkdownParser = async function* (messages: Message[]) {
  const textStream = await getTextStream(messages);
  const reader = textStream.getReader();

  // We maintain state about the current block being built and whether we're in a code block
  let currentBlock = "";
  let insideCodeBlock = false;

  // Example input stream:
  // "Here is some text\n```js\nconst x = 1;\n```\nMore text"
  // Will yield blocks:
  // 1. "Here is some text"
  // 2. "```js\nconst x = 1;\n```"
  // 3. "More text"

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Process each character individually
    for (const char of value) {
      if (char === "`" && currentBlock.endsWith("``")) {
        // Found a code block marker
        if (insideCodeBlock) {
          // Closing code block
          currentBlock += char;
          yield currentBlock;
          currentBlock = "";
          insideCodeBlock = false;
        } else {
          // Opening code block
          // First yield any accumulated regular text
          if (currentBlock && !currentBlock.endsWith("``")) {
            yield currentBlock;
            currentBlock = "";
          }
          currentBlock += char;
          insideCodeBlock = true;
        }
      } else if (char === "\n" && !insideCodeBlock) {
        // Line break outside code block - yield current block
        if (currentBlock) {
          yield currentBlock;
          currentBlock = "";
        }
      } else {
        // Add character to current block
        currentBlock += char;
      }
    }
  }

  // Yield final block if anything remains
  if (currentBlock) {
    yield currentBlock;
  }
};

const GenerateAssistantReply = async ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const messages = await getMessages(conversationId);
  const generateBlocks = await generateBlocksForMarkdownParser(messages);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <StreamableParse
        generateBlocks={generateBlocks}
        buffer=""
        conversationId={conversationId}
      />
    </div>
  );
};

const StreamableParse = async ({
  generateBlocks,
  buffer,
  conversationId,
}: {
  generateBlocks: AsyncGenerator<string>;
  buffer: string;
  conversationId: string;
}) => {
  const { done, value: block } = await generateBlocks.next();
  if (done) {
    await addMessage(conversationId, {
      role: "assistant",
      content: buffer,
    });
    return;
  }

  return (
    <>
      <div>
        <ParseToMarkdown block={block} />
      </div>
      <Suspense fallback={<Spinner />}>
        <StreamableParse
          generateBlocks={generateBlocks}
          buffer={buffer + "\n\n" + block}
          conversationId={conversationId}
        />
      </Suspense>
    </>
  );
};

const ParseToMarkdown = ({ block }: { block: string }) => {
  return compiler(block, { wrapper: null });
};

export const getInitialMessagesReactNode = async (
  conversationId: string
): Promise<ReactNode> => {
  const messages = await getMessages(conversationId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {messages.map((message, index) => (
        <div key={index}>
          {message.role === "user" ? (
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <div>{message.content}</div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <ParseToMarkdown block={message.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Spinner = () => {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          animation: "spin 0.5s linear infinite",
          borderRadius: "50%",
          height: "1rem",
          width: "1rem",
          border: "2px solid #d1d5db",
          borderTopColor: "#4b5563",
        }}
      />
    </>
  );
};
