import { redirect } from "next/navigation";
import prisma from "@/app/db/prisma";
import { SpinnerInForm } from "./[id]/spinner";
import Link from "next/link";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { RenderFromPending } from "./[id]/render-from-pending";

export default async function Page() {
  return (
    <>
      <NewChat />
      <Suspense fallback={<ConversationsLoadingSkeleton />}>
        <ListConversations />
      </Suspense>
    </>
  );
}

const NewChat = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">All Conversations</h1>
      <form
        action={async () => {
          "use server";
          const conversation = await prisma.conversation.create({
            data: {},
          });
          redirect(`/chat/${conversation.id}`);
        }}
      >
        <button
          type="submit"
          className="flex items-center justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
  );
};

const ListConversations = async () => {
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: {
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="relative">
            <Link
              href={`/chat/${conversation.id}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-600"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.messages[0]?.content || "New Conversation"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {conversation.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </Link>
            <form
              action={async () => {
                "use server";
                console.log("Deleting conversation", conversation.id);
                // Delete all messages first to avoid foreign key constraint violation
                await prisma.message.deleteMany({
                  where: { conversationId: conversation.id },
                });
                await prisma.conversation.delete({
                  where: { id: conversation.id },
                });
                revalidatePath("/chat");
              }}
              className="absolute top-2 right-2"
            >
              <button
                type="submit"
                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
        <div className="text-center py-12">
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
          className="block p-6 bg-white rounded-xl border border-gray-200 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"></div>
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
