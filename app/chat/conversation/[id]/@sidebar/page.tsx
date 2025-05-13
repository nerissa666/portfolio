import { auth } from "@clerk/nextjs/server";
import { getConversationsByUser } from "@/app/db/redis";
import ConversationList from "./conversations-list";

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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Conversations
        </h2>
        <Conversations />
      </div>
    </div>
  );
}
