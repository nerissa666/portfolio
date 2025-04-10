"use client";

import { useState, useEffect, useRef } from "react";
import { getQueryFollowUp } from "./follow-up.action";

export const FollowUp = ({ query }: { query: string }) => {
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
      label: "Explain origin in Chinese",
      value: "用中文解释这个英文单词的来历?",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const currentQuestion = question;
    setQuestion("");

    // Add the question immediately with an empty answer
    setMessages((prev) => [...prev, { question: currentQuestion, answer: "" }]);
    scrollToBottom();

    try {
      const generator = await getQueryFollowUp(query, currentQuestion);
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

      scrollToBottom();
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleCandidateQuestion = async (questionText: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { question: questionText, answer: "" }]);
    scrollToBottom();

    try {
      const generator = await getQueryFollowUp(query, questionText);
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
      scrollToBottom();
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          question: questionText,
          answer: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative follow-up-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
      >
        ?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-80 sm:w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="p-4 h-full flex flex-col">
              {/* Update candidate questions section */}
              <div className="mb-4 flex flex-wrap gap-2">
                {candidateQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleCandidateQuestion(q.value)}
                    disabled={isLoading}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {message.question}
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap font-serif">
                      {message.answer}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 rounded-full border-t-gray-600" />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
