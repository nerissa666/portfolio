import prisma from "@/app/db/prisma";
import { getInitialMessagesReactNode, getMessageReactNode } from "./action";
import ClientPage from "./client-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return (
    <ClientPage
      conversationId={id}
      getMessageReactNode={getMessageReactNode}
      initialMessagesReactNode={await getInitialMessagesReactNode(id)}
    />
  );
}
