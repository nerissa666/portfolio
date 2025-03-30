"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { IMessage } from "./_types/message-type";
import { ChatInput } from "./_components/chat-input";
import { LanguageSelector } from "./_components/language-selector";
import { RenderMessages } from "./_components/render-messages";
import { ChatLayout } from "./_components/chat-layout";
import { getChatResponse } from "./chat.action";

export const ChatPage = () => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"zh" | "en">(() => {
    const langParam = searchParams.get("lang");
    return langParam === "zh" || langParam === "en" ? langParam : "en";
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      setMessages((prev: IMessage[]) => [
        ...prev,
        { role: "user", content: currentMessage },
      ]);
    });

    try {
      const generator = await getChatResponse(
        [
          ...messages.slice(0, -5).map((msg: IMessage) => ({
            ...msg,
            content: msg.content.slice(0, 500),
          })),
          ...messages.slice(-5).map((msg: IMessage) => ({
            ...msg,
            content: msg.content,
          })),
          { role: "user", content: currentMessage },
        ],
        language
      );

      let fullAnswer = "";

      for await (const obj of generator) {
        const { text, mode, firstChunkOfNewMessage } = obj;

        if (firstChunkOfNewMessage) {
          flushSync(() => {
            setMessages((prev: IMessage[]) => [
              ...prev,
              { role: "assistant", content: text, mode },
            ]);
          });
          fullAnswer = text;
        } else {
          fullAnswer += text;
          flushSync(() => {
            setMessages((prev: IMessage[]) => {
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
      setMessages((prev: IMessage[]) => [
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
    <ChatLayout
      messages={<RenderMessages messages={messages} language={language} />}
      control={
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
      }
    />
  );
};
