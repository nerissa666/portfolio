"use client";

import { useState } from "react";
import { Reminder } from "@/app/db/redis";
import { deleteReminderAction } from "./reminder.action";

interface ReminderListProps {
  initialReminders: Reminder[];
}

export function ReminderList({ initialReminders }: ReminderListProps) {
  const [reminders, setReminders] = useState(initialReminders);

  const handleDelete = async (id: string) => {
    try {
      const updatedReminders = await deleteReminderAction(id);
      setReminders(updatedReminders);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
        <p className="text-gray-500 text-center">No reminders found</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow border border-blue-100">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">🔔</span>
        <h3 className="text-lg font-semibold">Your Reminders</h3>
      </div>
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="bg-blue-50 p-3 rounded-md flex justify-between items-start group"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-800">{reminder.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                Added on {new Date(reminder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(reminder.id)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete reminder"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
