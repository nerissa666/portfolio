import React from "react";
import { MarkdownContent } from "./markdown-content";

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

// Message component
export const Message = React.memo(
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
            message.role === "user"
              ? "bg-blue-600 text-gray-50"
              : "bg-gray-700/50 text-gray-50"
          }`}
        >
          {message.role === "assistant" && message.mode && (
            <div className="text-xs text-gray-400 mb-1">
              {message.mode === "reasoning" &&
                (language === "zh" ? "分析模式" : "Analytical")}
              {message.mode === "casual" &&
                (language === "zh" ? "对话模式" : "Conversational")}
              {message.mode === "serious" &&
                (language === "zh" ? "专业模式" : "Professional")}
            </div>
          )}
          <div className="prose prose-invert max-w-none prose-pre:bg-gray-800/50">
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

Message.displayName = "Message";
