"use client";

import { useEffect, useState, useRef } from "react";
import { Message } from "ai";
import { getDraftFromMessages } from "./actions";
import { MarkdownParser } from "../conversation/[id]/markdown-parser";

interface DraftProps {
  messages: Message[];
  onDraftComplete: (draftContent: string) => void;
}
export default function Draft({ messages, onDraftComplete }: DraftProps) {
  const [draft, setDraft] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateDraft = async () => {
      try {
        const stream = await getDraftFromMessages(messages);
        let fullDraft = "";

        for await (const chunk of stream) {
          fullDraft += chunk;
          setDraft(fullDraft);
        }

        onDraftComplete(fullDraft);
      } catch (error) {
        console.error("Error generating draft:", error);
      }
    };

    generateDraft();
  }, [messages]);

  // Scroll to bottom whenever draft updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [draft]);

  return (
    <div ref={containerRef} className="p-4 max-h-[500px] overflow-y-auto">
      <MarkdownParser content={draft} />
    </div>
  );
}
