"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { CompleteToolCallPayload } from "@/app/db/redis";

// Create the context with default value
const ToolCallContext = createContext<{
  toolCallId: string;
  toolCallGroupId: string;
} | null>(null);

// Provider component
export function ToolCallProvider({
  children,
  toolCallId,
  toolCallGroupId,
}: {
  children: ReactNode;
  toolCallId: string;
  toolCallGroupId: string;
}) {
  return (
    <ToolCallContext.Provider value={{ toolCallId, toolCallGroupId }}>
      {children}
    </ToolCallContext.Provider>
  );
}

// Save tool call result in client component
export function useSaveToolCallResult(
  completeToolCallServerAction: (
    payload: CompleteToolCallPayload
  ) => Promise<ReactNode>
) {
  const context = useContext(ToolCallContext);
  const [node, setNode] = useState<ReactNode | null>(null);

  if (context === null) {
    throw new Error("useToolCall must be used within a ToolCallProvider");
  }

  const saveToolCallResult = async <RESULT,>(result: RESULT) => {
    const node = await completeToolCallServerAction({
      toolCallGroupId: context.toolCallGroupId,
      toolCallId: context.toolCallId,
      result,
    });
    setNode(node);
  };

  return {
    saveToolCallResult,
    node,
  };
}

// Commonly used in RSC
export function SaveToolCallResult<RESULT>({
  result,
  completeToolCallServerAction,
}: {
  result: RESULT;
  completeToolCallServerAction: (
    payload: CompleteToolCallPayload
  ) => Promise<ReactNode>;
}) {
  const { saveToolCallResult, node } = useSaveToolCallResult(
    completeToolCallServerAction
  );
  const isSaved = useRef(false);
  useEffect(() => {
    if (!isSaved.current) {
      saveToolCallResult(result);
      isSaved.current = true;
    }
  }, [result, saveToolCallResult, isSaved]);
  return node;
}
