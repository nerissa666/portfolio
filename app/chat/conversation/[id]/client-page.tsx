"use client";
import { ReactNode, useState, useEffect, useRef } from "react";
import { RenderFromPending } from "./render-from-pending";
import { type getMessageReactNode as getMessageReactNodeType } from "./action";
import { NewResponseProvider } from "./get-new-response-context";

export default function ClientPage({
  conversationId,
  getMessageReactNode,
  initialMessagesReactNode,
}: {
  conversationId: string;
  getMessageReactNode: typeof getMessageReactNodeType;
  initialMessagesReactNode: ReactNode;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ReactNode[]>([
    initialMessagesReactNode,
  ]);
  const bottomOfPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const element = textareaRef.current;
    element?.addEventListener("keydown", handleKeyDown);

    return () => {
      element?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <NewResponseProvider
      triggerNewResponse={async () => {
        const newNode = await getMessageReactNode(conversationId, null);
        setMessages((prev) => [...prev, newNode]);
      }}
    >
      <div
        className="flex flex-col"
        style={{ height: "calc(var(--vh, 1vh) * 100 - 60px)" }}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            {messages.length === 0 ||
            (Array.isArray(messages[0]) &&
              messages.length === 1 &&
              messages[0].length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Fast Chat
                </h1>
                <div className="text-gray-600 max-w-md mb-8">
                  <p>Start a conversation by typing a message below.</p>
                </div>
              </div>
            ) : (
              <>
                {messages}
                <div className="h-[50vh]" />
                <div ref={bottomOfPageRef} />
              </>
            )}
          </div>
        </div>

        <div className="w-full border-t border-gray-200 bg-white">
          <form
            ref={formRef}
            action={async () => {
              if (!inputValue.trim()) return;
              const newNode = await getMessageReactNode(
                conversationId,
                inputValue
              );
              setMessages((prev) => [...prev, newNode]);
              setInputValue("");
              bottomOfPageRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <div ref={inputRef} className="p-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 pr-12 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type a message... (Enter to send, Shift + Enter for new line)"
                  rows={3}
                />
                <button
                  type="submit"
                  className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 cursor-pointer transition-colors"
                  aria-label="Send message"
                >
                  <RenderFromPending
                    pendingNode={
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-gray-600 animate-spin" />
                    }
                    notPendingNode={
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    }
                  />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </NewResponseProvider>
  );
}
