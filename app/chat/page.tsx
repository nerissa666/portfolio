import { redirect } from "next/navigation";
import { SpinnerInForm } from "./conversation/[id]/spinner";
import Link from "next/link";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { RenderFromPending } from "./conversation/[id]/render-from-pending";
import { auth } from "@clerk/nextjs/server";
import {
  createConversation,
  deleteConversation,
  getConversationsByUser,
  getFirstMessageOfConversation,
  getUserInformation,
  deleteUserInformation,
  deleteAllConversations,
} from "../db/redis";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/chat/login");
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <NewChat userId={userId} />

        <Suspense fallback={<ConversationsLoadingSkeleton />}>
          <ListConversations userId={userId} />
        </Suspense>

        <Suspense fallback={<PersonalContextLoadingSkeleton />}>
          <PersonalContext />
        </Suspense>
      </div>
    </div>
  );
}

const NewChat = ({ userId }: { userId: string }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b border-gray-200 pb-4">
      <h1 className="text-2xl font-bold text-gray-900">My Conversations</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Suspense fallback={null}>
          <ClearAllButton userId={userId} />
        </Suspense>
        <form
          action={async () => {
            "use server";
            const conversation = await createConversation({ userId });
            redirect(`/chat/conversation/${conversation.id}`);
          }}
        >
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center py-2 px-6 rounded-md text-sm font-medium text-white bg-gray-900 hover:bg-[#611f69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Chat
            <span className="ml-2">
              <SpinnerInForm />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

const ClearAllButton = async ({ userId }: { userId: string }) => {
  const conversations = await getConversationsByUser(userId);

  if (conversations.length === 0) {
    return null;
  }

  return (
    <form
      action={async () => {
        "use server";
        await deleteAllConversations(userId);
        revalidatePath("/chat");
      }}
    >
      <button
        type="submit"
        className="w-full sm:w-auto flex items-center justify-center py-2 px-6 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Clear All
        <span className="ml-2">
          <SpinnerInForm />
        </span>
      </button>
    </form>
  );
};

const PersonalContext = async () => {
  const userInfo = await getUserInformation();

  return (
    <div className="mb-8 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-[#4A154B]"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        Personal Context
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userInfo.map((info, index) => (
          <div key={index} className="relative">
            <div className="p-4 bg-white rounded-md border border-gray-200 hover:border-[#4A154B] transition-colors shadow-sm pr-10">
              <p className="text-sm text-gray-700">{info}</p>
              <form
                action={async () => {
                  "use server";
                  await deleteUserInformation(info);
                  revalidatePath("/chat");
                }}
                className="absolute top-2 right-2"
              >
                <button
                  type="submit"
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                  title="Delete information"
                >
                  <RenderFromPending
                    pendingNode={
                      <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    }
                    notPendingNode={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  />
                </button>
              </form>
            </div>
          </div>
        ))}
        {userInfo.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-gray-500">No personal information stored yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ListConversations = async ({ userId }: { userId: string }) => {
  const conversations = await getConversationsByUser(userId);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="relative">
            <Link
              href={`/chat/conversation/${conversation.id}`}
              className="block p-4 bg-white rounded-md border border-gray-200 hover:border-[#4A154B] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-md bg-[#4A154B] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <Suspense fallback={null}>
                    <ConversationPreview conversationId={conversation.id} />
                  </Suspense>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {conversation.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </Link>
            <form
              action={async () => {
                "use server";
                await deleteConversation(conversation.id, userId);

                revalidatePath("/chat");
              }}
              className="absolute top-2 right-2"
            >
              <button
                type="submit"
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                title="Delete conversation"
              >
                <RenderFromPending
                  pendingNode={
                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  }
                  notPendingNode={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                />
              </button>
            </form>
          </div>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-md mt-4 border border-gray-200">
          <p className="text-gray-500">
            No conversations yet. Start a new chat!
          </p>
        </div>
      )}
    </>
  );
};

const ConversationsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="block p-4 bg-white rounded-md border border-gray-200 animate-pulse"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ConversationPreview = async ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const message = await getFirstMessageOfConversation(conversationId);
  if (message?.role !== "user" || typeof message?.content !== "string") {
    return null;
  }
  return (
    <p className="text-sm font-medium text-gray-800 truncate">
      {message?.content || "New Conversation"}
    </p>
  );
};

const PersonalContextLoadingSkeleton = () => {
  return (
    <div className="mb-8 mt-8">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
};
