"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { shareDraft } from "./actions";

interface FeedbackProps {
  draft: string;
  onFeedbackComplete: (feedback: string) => void;
}

export default function Feedback({ draft, onFeedbackComplete }: FeedbackProps) {
  const [feedback, setFeedback] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFeedbackComplete(feedback);
  };

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);
      const { id } = await shareDraft(draft);
      router.push(`/chat/notes/${id}`);
    } catch (error) {
      console.error("Error sharing draft:", error);
      setIsSharing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
          Provide your feedback on the draft
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full h-[200px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A154B] focus:border-transparent resize-none"
          placeholder="Enter your feedback here..."
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#4A154B] text-white rounded-md hover:bg-[#6B206C] transition-colors"
        >
          Submit Feedback
        </button>
        <div className="flex items-center">
          <span className="text-gray-500 mx-2">---- OR ----</span>
        </div>
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-md transition-colors ${
            isSharing ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          {isSharing ? "Sharing..." : "Share Draft"}
        </button>
      </div>
    </form>
  );
}
