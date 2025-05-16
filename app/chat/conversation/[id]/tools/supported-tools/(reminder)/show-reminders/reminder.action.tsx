"use server";

import {
  deleteReminder,
  updateReminder,
  listAllReminders,
  Reminder,
} from "@/app/db/redis";
import { auth } from "@clerk/nextjs/server";

export async function deleteReminderAction(
  reminderId: string
): Promise<Reminder[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  await deleteReminder(reminderId);

  return await listAllReminders();
}

export async function updateReminderAction(
  reminderId: string,
  content: string
): Promise<Reminder[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  await updateReminder(reminderId, content);
  return listAllReminders();
}
