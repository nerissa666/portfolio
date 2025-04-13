"use client";
import { ReactNode, useState } from "react";
import { Message } from "../types";

export default function ClientPage({
  conversationId,
  getMessageReactNode,
  initialMessagesReactNode,
}: {
  conversationId: string;
  getMessageReactNode: (
    conversationId: string,
    message: Message
  ) => Promise<ReactNode>;
  initialMessagesReactNode: ReactNode;
}) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ReactNode[]>([
    initialMessagesReactNode,
  ]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    const message = { role: "user", content: inputValue } as const;
    const newNode = await getMessageReactNode(conversationId, message);
    setMessages((prev) => [...prev, newNode]);
    setInputValue("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "white",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.25rem",
            }}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3b82f6")
            }
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
