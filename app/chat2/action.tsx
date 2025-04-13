"use server";

import { streamText } from "ai";
import { Message } from "./types";
import { openai } from "@ai-sdk/openai";
import { ReactNode, Suspense } from "react";
import { compiler } from "markdown-to-jsx";

const getTextStream = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return textStream;
};

const messages: Message[] = [];
const getMessages = async () => {
  return messages;
};
const addMessage = async (message: Message) => {
  messages.push(message);
};

export const getMessageReactNode = async (
  message: Message
): Promise<ReactNode> => {
  await addMessage(message);
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
          <GenerateAssistantReply />
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

const GenerateAssistantReply = async () => {
  const messages = await getMessages();
  const generateBlocks = await generateBlocksForMarkdownParser(messages);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <StreamableParse generateBlocks={generateBlocks} buffer="" />
    </div>
  );
};

const StreamableParse = async ({
  generateBlocks,
  buffer,
}: {
  generateBlocks: AsyncGenerator<string>;
  buffer: string;
}) => {
  const { done, value: block } = await generateBlocks.next();
  if (done) {
    await addMessage({
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
        />
      </Suspense>
    </>
  );
};

const ParseToMarkdown = ({ block }: { block: string }) => {
  return compiler(block, { wrapper: null });
};

export const getInitialMessagesReactNode = async (): Promise<ReactNode> => {
  const messages = await getMessages();

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
  );
};
