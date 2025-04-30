"use client";

import { useEffect, useState } from "react";
import { Reminder } from "@/app/db/redis";
import { deleteReminderAction, updateReminderAction } from "./reminder.action";
import { GetNewResponse } from "../get-new-response-context";
import { useToolCall } from "./tool-call-context";
import { createToolCallMessage } from "./tool-call.action";

interface SearchResult {
  item: Reminder;
  score: number;
}

interface EditReminderDialogProps {
  reminder: Reminder;
  allReminders: Reminder[];
  searchResults: SearchResult[];
  action: "edit" | "delete";
  newContent?: string;
}

export function EditReminderDialog({
  reminder,
  searchResults,
  action,
  newContent,
}: EditReminderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [messageCreated, setMessageCreated] = useState(false);
  const toolCall = useToolCall();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      if (action === "delete") {
        await deleteReminderAction(reminder.id);
      } else {
        if (!newContent) {
          throw new Error("New content is required for editing");
        }
        await updateReminderAction(reminder.id, newContent);
      }
      setIsCompleted(true);
    } catch (error) {
      console.error(`Failed to ${action} reminder:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCompleted && !messageCreated) {
      createToolCallMessage(
        toolCall.conversationId,
        toolCall.toolCall,
        reminder
      )
        .then(() => {
          setMessageCreated(true);
        })
        .catch((error) => {
          console.error("Failed to create tool call message:", error);
        });
    }
  }, [isCompleted, messageCreated, toolCall, reminder]);

  if (isCompleted && messageCreated) {
    return (
      <>
        Action completed
        <GetNewResponse />
      </>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow border border-blue-100">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{action === "edit" ? "✏️" : "🗑️"}</span>
        <h3 className="text-lg font-semibold">
          {action === "edit" ? "Edit Reminder" : "Delete Reminder"}
        </h3>
      </div>

      {/* Show other potential matches if there are any */}
      {searchResults.length > 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Other potential matches:</p>
          <div className="space-y-2">
            {searchResults.slice(1).map((result) => (
              <div
                key={result.item.id}
                className="bg-gray-50 p-2 rounded text-sm text-gray-600"
              >
                {result.item.content}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-gray-500 mb-1">Current Content</p>
        <p className="font-medium text-gray-800 mb-3">{reminder.content}</p>

        {action === "edit" && newContent && (
          <>
            <p className="text-sm text-gray-500 mb-1">New Content</p>
            <p className="font-medium text-gray-800 mb-3">{newContent}</p>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              action === "edit"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-red-500 text-white hover:bg-red-600"
            } disabled:opacity-50`}
          >
            {isLoading
              ? "Processing..."
              : action === "edit"
              ? "Confirm Edit"
              : "Confirm Delete"}
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Added on {new Date(reminder.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
