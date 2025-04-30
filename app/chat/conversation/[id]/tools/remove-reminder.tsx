import { z } from "zod";
import { deleteReminder, listAllReminders } from "@/app/db/redis";

const paramsSchema = z.object({
  content: z
    .string()
    .describe("The content or description of the reminder to remove"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description: "A tool to remove a reminder by its content or description",
  parameters: paramsSchema,
};

export async function execute(
  args: ParamsType,
  saveToolCallResult: <T>(result: T) => void
) {
  try {
    const reminders = await listAllReminders();
    const reminderToRemove = reminders.find((reminder) =>
      reminder.content.toLowerCase().includes(args.content.toLowerCase())
    );

    if (!reminderToRemove) {
      throw new Error(`No reminder found matching "${args.content}"`);
    }

    const success = await deleteReminder(reminderToRemove.id);
    if (!success) {
      throw new Error("Failed to remove reminder");
    }

    const remainingReminders = await listAllReminders();
    saveToolCallResult(remainingReminders);

    return (
      <div className="p-4 bg-white rounded-lg shadow border border-blue-100">
        <div className="flex items-center mb-3">
          <span className="text-2xl mr-2">🗑️</span>
          <h3 className="text-lg font-semibold">Reminder Removed</h3>
        </div>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-500 mb-1">Removed Reminder</p>
          <p className="font-medium text-gray-800">
            {reminderToRemove.content}
          </p>
        </div>
        {remainingReminders.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            You have {remainingReminders.length} reminder
            {remainingReminders.length === 1 ? "" : "s"} remaining
          </div>
        )}
      </div>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to remove reminder";
    saveToolCallResult({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
}
