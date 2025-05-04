"use client";

import React, { createContext, useContext, ReactNode } from "react";

// Create the context with default value
const ToolCallContext = createContext<{
  toolCall: unknown;
  conversationId: string;
} | null>(null);

// Provider component
export function ToolCallProvider({
  children,
  toolCall,
  conversationId,
}: {
  children: ReactNode;
  toolCall: unknown;
  conversationId: string;
}) {
  return (
    <ToolCallContext.Provider value={{ toolCall, conversationId }}>
      {children}
    </ToolCallContext.Provider>
  );
}

// Custom hook to use the tool call context
export function useToolCall() {
  const context = useContext(ToolCallContext);
  if (context === null) {
    throw new Error("useToolCall must be used within a ToolCallProvider");
  }
  return context;
}
