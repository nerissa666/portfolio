"use server";

import { deleteReminder, listAllReminders, Reminder } from "@/app/db/redis";

export async function deleteReminderAction(
  reminderId: string
): Promise<Reminder[]> {
  await deleteReminder(reminderId);

  return await listAllReminders();
}
