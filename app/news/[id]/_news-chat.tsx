"use client";

import { useState, useEffect, useRef } from "react";
import { getNewsChat } from "./news-chat.action";
import { MarkdownParser } from "@/app/chat/conversation/[id]/markdown-parser";

export const NewsChat = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ question: string; answer: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add candidate questions
  const candidateQuestions = [
    {
      label: "总结要点",
      value: "请总结这篇文章的要点",
    },
    {
      label: "背景分析",
      value: "这条新闻的背景是什么？",
    },
    {
      label: "影响分析",
      value: "这会带来什么影响？",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && target.classList.contains("bg-opacity-50")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isLoading]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion("");

    // Add the question immediately with an empty answer
    setMessages((prev) => [...prev, { question: currentQuestion, answer: "" }]);

    try {
      const generator = await getNewsChat(title, content, currentQuestion);
      let fullAnswer = "";

      for await (const value of generator) {
        fullAnswer += value;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            question: currentQuestion,
            answer: fullAnswer,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          question: currentQuestion,
          answer: "抱歉，出现了错误。请重试。",
        };
        return newMessages;
      });
    }

    setIsLoading(false);
  };

  const handleCandidateQuestion = async (questionText: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { question: questionText, answer: "" }]);

    try {
      const generator = await getNewsChat(title, content, questionText);
      let fullAnswer = "";

      for await (const value of generator) {
        fullAnswer += value;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            question: questionText,
            answer: fullAnswer,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          question: questionText,
          answer: "抱歉，出现了错误。请重试。",
        };
        return newMessages;
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors group"
        aria-label="打开对话"
      >
        <svg
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="w-full sm:max-w-md h-[85vh] sm:h-[70vh] max-h-[700px] bg-white rounded-t-2xl sm:rounded-lg shadow-xl border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  聊聊这篇文章
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="关闭对话"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-4">
              {/* Candidate questions section */}
              {messages.length === 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {candidateQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => handleCandidateQuestion(q.value)}
                      disabled={isLoading}
                      className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-sm">问我关于这篇文章的任何问题</p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={index} className="mb-6">
                    <div className="bg-blue-50 text-blue-900 p-3 rounded-lg mb-2">
                      <p className="font-medium text-sm">{message.question}</p>
                    </div>
                    <div className="bg-gray-50 text-gray-700 p-3 rounded-lg">
                      {message.answer ? (
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <MarkdownParser content={message.answer} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 rounded-full border-t-gray-600" />
                          <span className="text-gray-500">思考中...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="relative mt-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="输入你的问题..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 p-1"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-300 rounded-full border-t-blue-600" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
