"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { getChatResponse } from "./chat.action";
import { throttle } from "lodash";
import "katex/dist/katex.min.css";
import { useSearchParams } from "next/navigation";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import "./markdown.css";

// Markdown component with memoization since it's pure
const MarkdownContent = React.memo(({ content }: { content: string }) => {
  const processedContent = content
    .replace(/\\\(/g, "$$")
    .replace(/\\\)/g, "$$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      className="markdown"
    >
      {processedContent}
    </ReactMarkdown>
  );
});

// Loading indicator component
const LoadingDots = () => (
  <span className="inline-flex items-center">
    <span className="animate-bounce">.</span>
    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
      .
    </span>
    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
      .
    </span>
  </span>
);

// Language selector component
const LanguageSelector = React.memo(
  ({
    language,
    onLanguageChange,
  }: {
    language: "zh" | "en";
    onLanguageChange: (lang: "zh" | "en") => void;
  }) => (
    <div className="mb-3 flex items-center justify-end gap-2">
      <label
        htmlFor="language-select"
        className="text-sm text-gray-600 font-medium"
      >
        {language === "zh" ? "语言：" : "Language:"}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as "zh" | "en")}
        className="text-sm px-3 py-1.5 rounded-md border border-gray-200
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
          bg-white hover:border-blue-500 transition-colors text-gray-700
          cursor-pointer"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  )
);

// Message component
const Message = React.memo(
  ({
    message,
    language,
  }: {
    message: { role: string; content: string; mode?: string };
    language: "zh" | "en";
  }) => (
    <div className="mb-4">
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 text-left ${
            message.role === "user" ? "bg-blue-100" : "bg-gray-100"
          }`}
        >
          {message.role === "assistant" && message.mode && (
            <div className="text-xs text-gray-600 mb-1">
              {message.mode === "reasoning" &&
                (language === "zh" ? "🤔 思考模式" : "🤔 Reasoning")}
              {message.mode === "chat" &&
                (language === "zh" ? "💬 聊天模式" : "💬 Chat")}
            </div>
          )}
          <div className="prose max-w-none">
            {message.content !== "\u200B" ? (
              <MarkdownContent content={message.content} />
            ) : (
              <LoadingDots />
            )}
          </div>
        </div>
      </div>
    </div>
  )
);

// Input form component
const ChatInput = React.memo(
  ({
    input,
    isLoading,
    language,
    inputRef,
    onInputChange,
    onSubmit,
  }: {
    input: string;
    isLoading: boolean;
    language: "zh" | "en";
    inputRef: React.RefObject<HTMLTextAreaElement>;
    onInputChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
  }) => (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={
          language === "zh"
            ? "输入消息...(AI会自动选择模型)"
            : "Type your message... (AI will pick the best model for you)"
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 pr-12 
          text-gray-900 placeholder-gray-500
          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none 
          resize-none h-[60px]"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
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
  )
);

// Main chat interface
export const ChatInterface = () => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<
    Array<{
      role: "system" | "user" | "assistant";
      content: string;
      mode?: string;
    }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"zh" | "en">(() => {
    const langParam = searchParams.get("lang");
    return langParam === "zh" || langParam === "en" ? langParam : "en";
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useRef(() => {
    const messages = document.querySelectorAll(".mb-4");
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }).current;

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    if (inputRef.current && isLoading == false) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const currentMessage = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: currentMessage }]);

    try {
      const generator = await getChatResponse(
        [
          ...messages.slice(0, -5).map((msg) => ({
            ...msg,
            content: msg.content.slice(0, 500),
          })),
          ...messages.slice(-5).map((msg) => ({
            ...msg,
            content: msg.content,
          })),
          { role: "user", content: currentMessage },
        ],
        language
      );

      let fullAnswer = "";
      let currentMode = "";
      let hasStartedMessage = false;

      for await (const obj of generator) {
        const { text, mode, firstChunkOfNewMessage } = obj;

        if (!hasStartedMessage || firstChunkOfNewMessage) {
          // Start a new message for first chunk or when flag is true
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: text, mode },
          ]);
          fullAnswer = text;
          hasStartedMessage = true;
          currentMode = mode;
        } else {
          // Append to existing message
          fullAnswer += text;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: fullAnswer,
            };
            return newMessages;
          });
        }
      }

      setIsLoading(false);
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
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto w-full max-w-3xl">
          <div
            className="h-full overflow-y-auto p-4 pb-[50vh]"
            ref={messagesContainerRef}
          >
            {messages.map((message, index) => (
              <Message key={index} message={message} language={language} />
            ))}
            <div className="h-12" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="mx-auto w-full max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <LanguageSelector
              language={language}
              onLanguageChange={setLanguage}
            />
            <ChatInput
              input={input}
              isLoading={isLoading}
              language={language}
              inputRef={inputRef}
              onInputChange={setInput}
              onSubmit={handleSubmit}
            />
          </form>
        </div>
      </div>
    </div>
  );
};
