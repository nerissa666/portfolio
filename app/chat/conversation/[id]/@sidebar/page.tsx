import { auth } from "@clerk/nextjs/server";
import { getConversationsByUser, createConversation } from "@/app/db/redis";
import ConversationList from "./conversations-list";
import { redirect } from "next/navigation";
import { SpinnerInForm } from "../spinner";

async function Conversations() {
  const { userId } = await auth();
  if (!userId) return null;

  const conversations = await getConversationsByUser(userId);
  return <ConversationList conversations={conversations} />;
}

export default function Page() {
  return (
    <div className="w-64 border-r border-gray-200 bg-white h-[calc(100vh-60px)] overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <form
            action={async () => {
              "use server";
              const { userId } = await auth();
              if (!userId) return;
              const conversation = await createConversation({ userId });
              redirect(`/chat/conversation/${conversation.id}`);
            }}
          >
            <button
              type="submit"
              className="flex items-center justify-center p-2.5 rounded-md text-sm font-medium text-white bg-[#4A154B] hover:bg-[#611f69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B] transition-colors w-10 h-10"
              title="New Conversation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1">
                <SpinnerInForm />
              </span>
            </button>
          </form>
        </div>
        <Conversations />
      </div>
    </div>
  );
}
