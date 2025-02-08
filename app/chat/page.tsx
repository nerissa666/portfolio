"use client";

import dynamic from "next/dynamic";

const Chat = dynamic(() => import("./_chat").then((mod) => mod.ChatInterface), {
  ssr: false,
});

export default function ChatPage() {
  return <Chat />;
}
