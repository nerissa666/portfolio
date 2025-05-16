import { addReminder } from "@/app/db/redis";
import { z } from "zod";
import { ExecuteFunction } from "../../tools";

const paramsSchema = z.object({
  content: z.string().describe("The content of the reminder"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description: "A tool to add a new reminder to user's reminder database",
  parameters: paramsSchema,
};

export const execute: ExecuteFunction<ParamsType> = async ({
  args,
  completeToolCallRsc,
}) => {
  try {
    const reminder = await addReminder(args.content);
    const node = await completeToolCallRsc({ addedRemindedr: reminder });

    return (
      <>
        {node}
        <div className="p-4 bg-white rounded-lg shadow border border-blue-100">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🔔</span>
            <h3 className="text-lg font-semibold">Reminder Created</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-gray-500 mb-1">Content</p>
            <p className="font-medium text-gray-800">{reminder.content}</p>
          </div>
          <div className="mt-3 text-xs text-gray-500 text-right">
            Added on {new Date(reminder.createdAt).toLocaleDateString()}
          </div>
        </div>
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create reminder";
    await completeToolCallRsc({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
};
