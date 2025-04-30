"use server";

import { createMessage } from "@/app/db/redis";

// TODO: this function is extremely unsafe, can be exploited by malicious users
export const createToolCallMessage = async (
  conversationId: string,
  toolCall: any, // TODO: Fix type
  result: any // TODO: Fix type
) => {
  return createMessage({
    conversationId,
    aiMessage: {
      role: "system",
      content: JSON.stringify([
        {
          type: "tool-result",
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          result,
        },
      ]),
    },
  });
};
