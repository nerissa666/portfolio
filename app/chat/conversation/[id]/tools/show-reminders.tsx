import { z } from "zod";
import { listAllReminders } from "@/app/db/redis";
import { ReminderList } from "./reminder-list";

const paramsSchema = z.object({});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description:
    "A tool to display all user reminders and provide options to manage them (e.g., delete)",
  parameters: paramsSchema,
};

export async function execute(
  args: ParamsType,
  saveToolCallResult: <T>(result: T) => void
) {
  try {
    const reminders = await listAllReminders();
    saveToolCallResult(reminders);
    return <ReminderList initialReminders={reminders} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch reminders";
    saveToolCallResult({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
}
