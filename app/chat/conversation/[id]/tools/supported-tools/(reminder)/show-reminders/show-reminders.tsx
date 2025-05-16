import { z } from "zod";
import { listAllReminders } from "@/app/db/redis";
import { ReminderList } from "./reminder-list";
import { ExecuteFunction } from "../../tools";

const paramsSchema = z.object({});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description:
    "A tool to display all user reminders and provide options to manage them (e.g., delete)",
  parameters: paramsSchema,
};

export const execute: ExecuteFunction<ParamsType> = async ({
  completeToolCallRsc,
}) => {
  try {
    const reminders = await listAllReminders();
    const node = await completeToolCallRsc(reminders);
    return (
      <>
        {node}
        <ReminderList initialReminders={reminders} />
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch reminders";
    await completeToolCallRsc({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
};
