import { Suspense } from "react";
import { Chat } from "./chat";

export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}

export const metadata = {
  title: "𝐹𝒶𝓈𝓉 Chat",
  description:
    "AI chat interface that automatically selects the most suitable model based on your message",
};
