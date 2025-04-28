import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Message } from "@/app/chat/types";
import { EXECUTE_TOOLS, TOOLS } from "./tools";

export const getLlmStream = async (messages: Message[]) => {
  return await streamText({
    model: openai("gpt-4o"),
    messages,
    tools: TOOLS,
  });
};

export const processToolCall = async (
  toolCall: Awaited<
    Awaited<ReturnType<typeof getLlmStream>>["toolCalls"]
  >[number]
) => {
  // TODO: processToolCall just renders the component, which is not sufficient, because
  // we also need a way to save the result of the tool call into DB
  // Consider adding a "saveToolCallResult" prop to the component
  // and then register the result into DB.
  const { toolName, args } = toolCall;
  const result = await EXECUTE_TOOLS[toolName](args);
  return result;
};
