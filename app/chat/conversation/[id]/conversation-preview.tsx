"use client";

import { useEffect, useState } from "react";
import { getConversationPreview } from "./actions";

export default function ConversationPreview({
  conversationId,
  isActive,
}: {
  conversationId: string;
  isActive: boolean;
}) {
  const [preview, setPreview] = useState<string>("Loading...");

  useEffect(() => {
    const loadPreview = async () => {
      const previewText = await getConversationPreview(conversationId);
      setPreview(previewText);
    };

    loadPreview();
  }, [conversationId]);

  return (
    <div
      className={`p-3 rounded-md transition-colors ${
        isActive ? "bg-[#4A154B] text-white" : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <p className="text-sm truncate">{preview}</p>
    </div>
  );
}
