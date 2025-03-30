import React from "react";

// Input form component
export const ChatInput = React.memo(
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
        className="w-full rounded-xl border border-gray-600 bg-gray-800/50 px-4 py-2 pr-12 
            text-gray-100 placeholder-gray-400
            focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none 
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

ChatInput.displayName = "ChatInput";
