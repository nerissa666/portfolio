import Link from "next/link";
import ConversationPreview from "./conversation-preview";

interface Conversation {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export default function ConversationList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/chat/conversation/${conversation.id}`}
          className="block"
        >
          <ConversationPreview conversationId={conversation.id} />
        </Link>
      ))}
    </div>
  );
}
