import { getOrCreateToolCallGroup } from "@/app/db/redis";
import { getLlmStream } from "../llm";
import { EXECUTE_TOOLS } from "../supported-tools/tools";
import { Suspense } from "react";
import { Spinner } from "../../spinner";
import { ToolCallWrapper } from "../../render-message";
import { ToolCallProvider } from "./tool-call-context";
import { completeToolCallServerAction } from "./tool-call-group.action";

export type ToolCalls = Awaited<
  Awaited<ReturnType<typeof getLlmStream>>["toolCalls"]
>;

export const ToolCallGroup = async ({
  conversationId,
  toolCalls,
}: {
  conversationId: string;
  toolCalls: ToolCalls;
}) => {
  // 1. define ID for tool call group: maybe use the tool call id of the first too call
  // 2. query the ToolCallGroup state from a Redis cache
  // 3. based on the state, render UI for each tool call in Tool Call Group
  // 4. send the ToolCallGroup ID to the UI so that
  //  -- UI can call a server action to save the result of the tool call
  //  -- NOTE: if you are the last person saving the result of the tool call via that
  //    server action, the server action will return a client component that instructs
  //    the Chat to get the next message from the LLM, so make sure you render
  //    whatever is returned from the server action

  const toolCallGroup = await getOrCreateToolCallGroup({
    conversationId,
    toolCalls,
  });

  const unfinishedToolCalls = toolCallGroup.toolCallResults.filter(
    (result) => !result.$completed
  );

  if (unfinishedToolCalls.length === 0) {
    return (
      <ToolCallWrapper>
        <ul className="list-disc pl-5 space-y-1">
          {toolCallGroup.toolCallResults.map((result) => (
            <li key={result.toolCallId}>
              <span className="font-medium">
                Executed <code>{result.toolName}</code>
              </span>
            </li>
          ))}
        </ul>
      </ToolCallWrapper>
    );
  }

  return (
    <ToolCallWrapper>
      {unfinishedToolCalls.map((toolCallResult, index) => {
        const { toolName, args } = toolCallResult;

        const ToolCallRsc = async () => {
          // avoid multiple tool calls DDOS'ing server.
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, index * 1000));
          }

          const completeToolCallRsc = async (result: unknown) => {
            return await completeToolCallServerAction({
              toolCallId: toolCallResult.toolCallId,
              toolCallGroupId: toolCallGroup.toolCalls[0].toolCallId,
              result,
            });
          };

          return await EXECUTE_TOOLS[toolName as keyof typeof EXECUTE_TOOLS]({
            args,
            completeToolCallServerAction,
            completeToolCallRsc,
          });
        };

        return (
          <Suspense fallback={<Spinner />} key={toolCallResult.toolCallId}>
            <ToolCallProvider
              toolCallId={toolCallResult.toolCallId}
              toolCallGroupId={toolCallGroup.toolCalls[0].toolCallId}
            >
              <ToolCallRsc />
            </ToolCallProvider>
          </Suspense>
        );
      })}
    </ToolCallWrapper>
  );
};
