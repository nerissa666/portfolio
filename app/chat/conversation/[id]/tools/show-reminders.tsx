import { z } from "zod";
import { listAllReminders } from "@/app/db/redis";
import { ReminderList } from "./reminder-list";
import { CompleteToolCallPayload } from "@/app/db/redis";
import { ReactNode } from "react";

const paramsSchema = z.object({});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description:
    "A tool to display all user reminders and provide options to manage them (e.g., delete)",
  parameters: paramsSchema,
};

export async function execute(
  args: ParamsType,
  completeToolCallServerAction: (
    payload: CompleteToolCallPayload
  ) => Promise<ReactNode>,
  toolCallData: {
    toolCallId: string;
    toolCallGroupId: string;
  }
) {
  try {
    const reminders = await listAllReminders();
    const node = await completeToolCallServerAction({
      ...toolCallData,
      result: reminders,
    });
    return (
      <>
        {node}
        <ReminderList initialReminders={reminders} />
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch reminders";
    await completeToolCallServerAction({
      toolCallGroupId: "",
      toolCallId: "",
      result: { error: errorMessage },
    });
    return <div className="text-red-500">{errorMessage}</div>;
  }
}
