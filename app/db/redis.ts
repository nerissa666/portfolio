import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import { CoreMessage } from "ai";
import { auth } from "@clerk/nextjs/server";

type AiMessage = CoreMessage;

const URL = process.env.AI_MESSAGES_REDIS_REDIS_URL;

if (!URL) {
  throw new Error("AI_MESSAGES_REDIS_REDIS_URL is not set");
}

const redis = new Redis(URL);

// Types
export interface Conversation {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Message extends Omit<AiMessage, "createdAt"> {
  id: string;
  conversationId: string;
  createdAt: number;
}

// Redis Schema
// ------------
// conversation:{id} -> JSON string of Conversation object
//   - Stores individual conversation data
//
// conversation:{conversationId}:messages -> List of Message IDs
//   - Stores message IDs in chronological order
//
// user:{userId}:conversations -> Sorted Set of Conversation IDs
//   - Maps user to their conversations
//   - Score: timestamp (for chronological ordering)
//   - Value: conversationId
//
// message:{id} -> JSON string of Message object
//   - Stores individual message data

// Conversation helpers
export async function createConversation({
  userId,
}: {
  userId: string;
}): Promise<Conversation> {
  const conversationId = uuid();
  const now = Date.now();
  const conversation: Conversation = {
    id: conversationId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(
    `conversation:${conversationId}`,
    JSON.stringify(conversation)
  );

  await redis.zadd(`user:${userId}:conversations`, now, conversationId);

  return conversation;
}

export async function getConversationsByUser(
  userId: string
): Promise<Conversation[]> {
  // Get all conversation IDs for this user in reverse chronological order (newest first)
  // We use a sorted set (zset) with timestamp as score to maintain conversation order
  // In Redis, 0 is the start index and -1 means "until the end of the list"
  const ids = await redis.zrevrange(`user:${userId}:conversations`, 0, -1);
  if (!ids.length) return [];

  const conversations = await Promise.all(
    ids.map((id) => redis.get(`conversation:${id}`))
  );

  return conversations.filter(Boolean).map((str) => JSON.parse(str!));
}

export async function getConversationById(
  id: string
): Promise<Conversation | null> {
  const conversation = await redis.get(`conversation:${id}`);
  return conversation ? JSON.parse(conversation) : null;
}

export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  await redis.del(`conversation:${conversationId}`);
  await redis.zrem(`user:${userId}:conversations`, conversationId);
  await deleteMessagesByConversation(conversationId);
}

export async function createMessage({
  conversationId,
  aiMessage,
}: {
  conversationId: string;
  aiMessage: Omit<AiMessage, "createdAt" | "id">;
}): Promise<Message> {
  const messageId = uuid();
  const now = Date.now();

  const message: Message = {
    ...aiMessage,
    id: messageId,
    conversationId,
    createdAt: now,
  } as const;

  await redis.set(`message:${messageId}`, JSON.stringify(message));
  await redis.rpush(`conversation:${conversationId}:messages`, messageId);

  // Update conversation's updatedAt and its position in the sorted set
  const conversation = await getConversationById(conversationId);
  if (conversation) {
    conversation.updatedAt = now;
    await redis.set(
      `conversation:${conversationId}`,
      JSON.stringify(conversation)
    );
    // Update the score in the sorted set to reflect new updatedAt
    await redis.zadd(
      `user:${conversation.userId}:conversations`,
      now,
      conversationId
    );
  }

  return message;
}

export async function getMessagesByConversation(
  conversationId: string
): Promise<Message[]> {
  const messageIds = await redis.lrange(
    `conversation:${conversationId}:messages`,
    0,
    -1
  );
  if (!messageIds.length) return [];

  const messages = await Promise.all(
    messageIds.map((id) => redis.get(`message:${id}`))
  );

  return messages.filter(Boolean).map((str) => JSON.parse(str!));
  // .sort(
  //   (a, b) =>
  //     new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  // ); // TODO: this sort is probably not needed, because we add messages in order
}

export async function getFirstMessageOfConversation(
  conversationId: string
): Promise<Message | null> {
  const messageIds = await redis.lrange(
    `conversation:${conversationId}:messages`,
    0,
    0
  );

  if (!messageIds.length) return null;

  const messageStr = await redis.get(`message:${messageIds[0]}`);
  if (!messageStr) return null;

  return JSON.parse(messageStr);
}

export async function deleteMessagesByConversation(
  conversationId: string
): Promise<void> {
  const messageIds = await redis.lrange(
    `conversation:${conversationId}:messages`,
    0,
    -1
  );
  if (messageIds.length) {
    const keys = messageIds.map((id) => `message:${id}`);
    await redis.del(...keys);
  }
  await redis.del(`conversation:${conversationId}:messages`);
}

// REMINDERS
// A user can have multiple reminders
// Each reminder now has just a content field, but keep it flexible

export interface Reminder {
  id: string;
  content: string;
  createdAt: number;
}

const getUserId = async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
};

/**
 * Adds a reminder for a user
 * @param content The content of the reminder
 * @returns The created reminder object
 */
export async function addReminder(content: string): Promise<Reminder> {
  const userId = await getUserId();
  const id = uuid();
  const reminder: Reminder = {
    id,
    content,
    createdAt: Date.now(),
  };

  // Store the reminder
  await redis.set(`reminder:${id}`, JSON.stringify(reminder));

  // Add the reminder ID to the user's list of reminders
  await redis.lpush(`user:${userId}:reminders`, id);

  return reminder;
}

/**
 * Lists all reminders for a user
 * @returns Array of reminder objects
 */
export async function listAllReminders(): Promise<Reminder[]> {
  const userId = await getUserId();

  // Get all reminder IDs for the user
  const reminderIds = await redis.lrange(`user:${userId}:reminders`, 0, -1);
  if (!reminderIds.length) return [];

  // Fetch all reminders
  const reminders = await Promise.all(
    reminderIds.map((id) => redis.get(`reminder:${id}`))
  );

  // Parse and return the reminders
  return reminders
    .filter(Boolean)
    .map((str) => JSON.parse(str!))
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
}

/**
 * Deletes a specific reminder
 * @param userId The ID of the user
 * @param reminderId The ID of the reminder to delete
 * @returns Boolean indicating whether the deletion was successful
 */
export async function deleteReminder(reminderId: string): Promise<boolean> {
  const userId = await getUserId();

  // Remove the reminder from the user's list
  const removed = await redis.lrem(`user:${userId}:reminders`, 1, reminderId);

  // If the reminder wasn't in the user's list, return false
  if (removed === 0) {
    return false;
  }

  // Delete the reminder object
  await redis.del(`reminder:${reminderId}`);

  return true;
}

/**
 * Updates a specific reminder's content
 * @param userId The ID of the user
 * @param reminderId The ID of the reminder to update
 * @param content The new content for the reminder
 * @returns Boolean indicating whether the update was successful
 */
export async function updateReminder(
  reminderId: string,
  content: string
): Promise<boolean> {
  // TODO: add authentication check, you should not be able to edit other people's reminder content!

  // Get the existing reminder
  const reminderStr = await redis.get(`reminder:${reminderId}`);
  if (!reminderStr) {
    return false;
  }

  // Parse the reminder
  const reminder = JSON.parse(reminderStr) as Reminder;

  // Update the reminder
  reminder.content = content;
  reminder.createdAt = Date.now();

  // Save the updated reminder
  await redis.set(`reminder:${reminderId}`, JSON.stringify(reminder));

  return true;
}

// For each user, we need to store a list of strings that contains information about that user.
// For instance, their name, their location, etc.
// We need to append to that list whenever the user unveils new information about themselves.
// We need to be able to retrieve the entire list of strings at any time.

/**
 * Adds a new piece of information about a user
 * @param information The new information to add
 * @returns Boolean indicating whether the operation was successful
 */
export async function addUserInformation(
  information: string
): Promise<boolean> {
  try {
    const userId = await getUserId();
    await redis.rpush(`user:${userId}:information`, information);
    return true;
  } catch (error) {
    console.error("Error adding user information:", error);
    return false;
  }
}

/**
 * Retrieves all information stored about a user
 * @returns Array of user information strings
 */
export async function getUserInformation(): Promise<string[]> {
  try {
    const userId = await getUserId();
    const informationArray = await redis.lrange(
      `user:${userId}:information`,
      0,
      -1
    );
    return informationArray;
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return [];
  }
}

/**
 * Deletes a specific piece of user information
 * @param information The information to delete
 * @returns Boolean indicating whether the operation was successful
 */
export async function deleteUserInformation(
  information: string
): Promise<boolean> {
  try {
    const userId = await getUserId();
    await redis.lrem(`user:${userId}:information`, 0, information);
    return true;
  } catch (error) {
    console.error("Error deleting user information:", error);
    return false;
  }
}
