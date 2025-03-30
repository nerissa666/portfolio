"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { getChatResponse } from "./chat.action";
import "katex/dist/katex.min.css";
import { useSearchParams } from "next/navigation";

import "highlight.js/styles/github.css";
import "./markdown.css";
import { flushSync } from "react-dom";
import { Message } from "./_components/message";
import { ChatInput } from "./_components/chat-input";
import { LanguageSelector } from "./_components/language-selector";

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
  }, [isLoading, scrollToBottom]);

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

    flushSync(() => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: currentMessage },
      ]);
    });

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
      // Track the full response and current chat mode
      let fullAnswer = "";

      // Process each chunk of the streamed response
      for await (const obj of generator) {
        const { text, mode, firstChunkOfNewMessage } = obj;

        if (firstChunkOfNewMessage) {
          // Start a new message when we receive the first chunk
          flushSync(() => {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: text,
                mode,
              },
            ]);
          });
          fullAnswer = text;
        } else {
          // Append text to existing message
          fullAnswer += text;
          flushSync(() => {
            setMessages((prev) => {
              const messages = [...prev];
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content: fullAnswer,
              };
              return messages;
            });
          });
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
    <div className="fixed inset-0 flex flex-col bg-gray-950">
      <div className="flex-1 overflow-hidden">
        <div className="h-full mx-auto w-full max-w-3xl">
          <div
            className="h-full overflow-y-auto p-4 pb-[50vh] text-gray-100"
            ref={messagesContainerRef}
          >
            {messages.map((message, index) => (
              <Message key={index} message={message} language={language} />
            ))}
            <div className="h-12" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-950 border-t border-gray-800 fixed bottom-0 left-0 right-0">
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
              inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
              onInputChange={setInput}
              onSubmit={handleSubmit}
            />
          </form>
        </div>
      </div>
    </div>
  );
};
