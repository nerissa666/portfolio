"use client";

import { useEffect, useOptimistic, useRef } from "react";

import { useFormStatus } from "react-dom";
import { useMessages } from "./use-messages";
import dynamic from "next/dynamic";
import { getAssistantMessageContentStream } from "./actions";

// Once we replace the local storage with
const LazyRenderMessages = dynamic(
  () => import("./render-messages").then((mod) => mod.RenderMessages),
  {
    ssr: false,
  }
);

export default function Chat() {
  const [messages, setMessages] = useMessages();

  const [optimisticMessages, setOptimisticMessages] = useOptimistic(messages);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#1a1d21]">
      <div className="mx-auto max-w-[1028px] px-4 min-h-screen flex flex-col bg-[#1a1d21] w-full">
        <div className="flex-1 space-y-4 my-4 overflow-y-auto">
          <LazyRenderMessages
            className="flex-1 space-y-4 my-4 overflow-y-auto"
            messages={optimisticMessages}
            bottomRef={bottomRef}
          />
        </div>

        <form
          ref={formRef}
          action={async (formData) => {
            const userInput = formData.get("userInput");
            if (typeof userInput !== "string" || userInput.length === 0) {
              return;
            }

            formRef.current?.reset();
            setTimeout(scrollToBottom, 0);

            const userMessage = {
              role: "user",
              content: userInput,
            } as const;

            setOptimisticMessages((previousMessages) => {
              return [
                ...previousMessages,
                userMessage,
                {
                  role: "assistant",
                  content: "",
                  isOptimistic: true,
                },
              ];
            });

            const assitantMessageContentStream =
              await getAssistantMessageContentStream([
                ...messages,
                userMessage,
              ]);

            let assistantMessageContent = "";
            for await (const assitantMessageContentChunk of assitantMessageContentStream) {
              assistantMessageContent += assitantMessageContentChunk;

              setOptimisticMessages((previousMessages) => {
                const clone = [...previousMessages];
                const lastMessage = clone.at(-1);
                if (!lastMessage || lastMessage.role !== "assistant") {
                  throw new Error(
                    "lastMessage should be optimistically set to an assistant message."
                  );
                }
                lastMessage.content += assitantMessageContentChunk;
                return clone;
              });
            }

            setMessages((messages) => [
              ...messages,
              ...[
                userMessage,
                {
                  role: "assistant",
                  content: assistantMessageContent,
                } as const,
              ],
            ]);
          }}
          className="flex gap-2 sticky bottom-0 bg-[#1a1d21] py-4 border-t border-[#2c2d30]"
        >
          <textarea
            ref={inputRef}
            name="userInput"
            placeholder="Type your message... (Shift+Enter to send)"
            className="flex-1 rounded-lg bg-[#2c2d30] text-white border-none p-2 focus:outline-none focus:ring-2 focus:ring-[#007a5a] placeholder-gray-400 resize-none min-h-[40px] max-h-[200px] pr-12"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <AutoFocusInput inputRef={inputRef} />
          <button
            type="submit"
            className="absolute bottom-6 right-2 bg-[#007a5a] text-white p-2 rounded-full hover:bg-[#006b4f] w-8 h-8 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

const AutoFocusInput = ({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) => {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!pending) {
      inputRef.current?.focus();
    }
  }, [pending, inputRef]);

  return null;
};
