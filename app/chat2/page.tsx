import { redirect } from "next/navigation";
import prisma from "@/app/db/prisma";
import { connection } from "next/server";

export default async function Page() {
  await connection();

  const conversation = await prisma.conversation.create({
    data: {},
  });

  redirect(`/chat2/${conversation.id}`);
}
