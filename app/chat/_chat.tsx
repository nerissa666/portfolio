"use client";

import { useState, useRef, useEffect } from "react";
import { getChatResponse } from "./chat.action";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export const ChatInterface = () => {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; mode?: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"zh" | "en">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const currentMessage = input;
    setInput("");

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: currentMessage }]);

    // Ensure scroll after adding user message
    setTimeout(scrollToBottom, 0);

    try {
      const generator = await getChatResponse(
        [...messages, { role: "user", content: currentMessage }],
        language
      );

      // Get first chunk to determine mode immediately
      const firstChunk = await generator.next();
      if (!firstChunk.done) {
        const { mode: initialMode } = firstChunk.value;
        let fullAnswer = firstChunk.value.text || "";

        // Add assistant message with empty content but with mode
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullAnswer, mode: initialMode },
        ]);

        // Process remaining chunks
        for await (const { text, mode } of generator) {
          fullAnswer += text;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              role: "assistant",
              content: fullAnswer,
              mode,
            };
            return newMessages;
          });
          setTimeout(scrollToBottom, 0);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto w-full max-w-4xl">
          <div className="h-full overflow-y-auto p-4 pb-[160px]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-6 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.role === "assistant" && message.mode && (
                    <div className="text-xs text-gray-500 mb-1">
                      {message.mode === "deep reasoning" && "🤔 Deep"}
                      {message.mode === "some reasoning" && "💭 Thinking"}
                      {message.mode === "serious chat" && "💬 Serious"}
                      {message.mode === "casual chat" && "😊 Casual"}
                    </div>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="prose"
                  >
                    {message.content || (
                      <span className="inline-flex items-center">
                        <span className="animate-bounce">.</span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        >
                          .
                        </span>
                        <span
                          className="animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        >
                          .
                        </span>
                      </span>
                    )}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t fixed bottom-0 left-0 right-0 shadow-lg">
        <div className="mx-auto w-full max-w-4xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="mb-3 flex items-center justify-end gap-2">
              <label
                htmlFor="language-select"
                className="text-sm text-gray-600 font-medium"
              >
                Language:
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "zh" | "en")}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-200
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
                  bg-white hover:border-blue-500 transition-colors text-gray-700
                  cursor-pointer"
              >
                <option value="zh">Chinese</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === "zh"
                    ? "输入消息...(AI会自动选择模型)"
                    : "Type your message... (AI will pick the best model for you)"
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none h-[100px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              {isLoading ? (
                <div className="absolute right-3 bottom-3">
                  <div className="animate-spin h-6 w-6 border-2 border-gray-300 rounded-full border-t-gray-600" />
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-3 bottom-3 text-blue-500 hover:text-blue-600 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
