"use client";

import { useState, useEffect, useRef } from "react";
import { getNextMessage, Phase } from "./actions";
import { Message } from "ai";
import { MarkdownParser } from "../conversation/[id]/markdown-parser";

interface BrainstormProps {
  onBrainstormEnd: (messages: Message[]) => void;
  initialBrainstormMessages: Message[];
}

export default function Brainstorm({
  onBrainstormEnd,
  initialBrainstormMessages,
}: BrainstormProps) {
  const phase: Phase =
    initialBrainstormMessages.length === 0 ? "zero-to-one" : "one-to-many";

  const [messages, setMessages] = useState<Message[]>(
    initialBrainstormMessages
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getNewMessage = async (
    messageList: Message[],
    party: "asker" | "responder",
    phase: Phase
  ) => {
    setIsLoading(true);
    try {
      const assistantMessage = await getNextMessage(messageList, party, phase);

      const newMessage = {
        id: Date.now().toString(),
        role: party === "responder" ? "user" : "assistant",
        content: assistantMessage,
      } as const;

      setMessages((prev) => [...prev, newMessage]);

      return newMessage;
    } catch (error) {
      console.error("Error getting message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoPilot && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isLoading) {
        handleSubmit(new Event("submit") as any);
      }
    }
  }, [messages, autoPilot, isLoading]);

  useEffect(() => {
    getNewMessage(initialBrainstormMessages, "asker", phase);
  }, []);

  // Focus input when not loading and not in auto-pilot
  useEffect(() => {
    if (!isLoading && !autoPilot && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, autoPilot]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      const swappedMessages = messages.map(
        (message) =>
          ({
            ...message,
            role:
              message.role === "assistant"
                ? "user"
                : message.role === "user"
                ? "assistant"
                : message.role,
          } as const)
      );

      const responderMessage = await getNewMessage(
        swappedMessages,
        "responder",
        phase
      );

      if (responderMessage) {
        await getNewMessage([...messages, responderMessage], "asker", phase);
      }

      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await getNewMessage([...messages, userMessage], "asker", phase);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">
            AI Agents Chat
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Phase: {phase}</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter(
            (message) => message.role === "assistant" || message.role === "user"
          )
          .map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "assistant"
                    ? "bg-white border border-gray-200 shadow-sm"
                    : "bg-purple-100 text-gray-800"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      message.role === "assistant"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    {message.role === "assistant" ? "AI Agent 1" : "AI Agent 2"}
                  </span>
                </div>
                <MarkdownParser content={message.content} />
              </div>
            </div>
          ))}
      </div>

      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#4A154B] focus:border-transparent min-h-[80px] resize-none"
            disabled={isLoading || autoPilot}
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#4A154B] text-white rounded-lg hover:bg-[#611f69] disabled:opacity-50 transition-colors"
              disabled={isLoading || autoPilot}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send"
              )}
            </button>
            <button
              type="button"
              onClick={async () => {
                setAutoPilot(!autoPilot);
                if (!autoPilot) {
                  handleSubmit(new Event("submit") as any);
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoPilot
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white`}
            >
              {autoPilot ? "Stop Auto-Pilot" : "Start Auto-Pilot"}
            </button>
            <button
              type="button"
              onClick={() => onBrainstormEnd(messages)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              End Brainstorm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
