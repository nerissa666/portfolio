"use client";

import { useEffect, useState } from "react";
import {
  cleanAllTranslationsAction,
  getExistingStoryIds,
  revalidateAndGetTopStories,
} from "./actions";

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">News Admin Dashboard</h1>
      <div className="grid gap-8">
        <CleanAllTranslations />
        <Revalidate />
      </div>
    </div>
  );
}

function CleanAllTranslations() {
  const [isCleaning, setIsCleaning] = useState(false);

  const handleClean = async () => {
    setIsCleaning(true);
    try {
      await cleanAllTranslationsAction();
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Translation Management</h2>
      <button
        onClick={handleClean}
        disabled={isCleaning}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
      >
        {isCleaning ? "Cleaning..." : "Clean All Translations"}
      </button>
    </div>
  );
}

function Revalidate() {
  const [topStories, setTopStories] = useState<
    Awaited<ReturnType<typeof revalidateAndGetTopStories>>
  >([]);

  const [existingStoryIds, setExistingStoryIds] = useState<
    Awaited<ReturnType<typeof getExistingStoryIds>>
  >([]);

  const [startTranslation, setStartTranslation] = useState(false);

  useEffect(() => {
    getExistingStoryIds().then((ids) => {
      setExistingStoryIds(ids);
    });

    revalidateAndGetTopStories().then((topStories) => {
      setTopStories(topStories);
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Story Translation</h2>
      <div className="mb-6">
        <button
          onClick={() => setStartTranslation(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Translate All Stories
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px_100px] gap-4 px-4 py-3 bg-gray-50 border-b font-medium text-gray-600">
          <div>ID</div>
          <div>Title</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        <div className="divide-y">
          {topStories.map((story) => (
            <StoryAction
              key={story.id}
              story={story}
              translated={existingStoryIds.includes(story.id)}
              startTranslation={startTranslation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const StoryAction = ({
  story,
  translated: wasTranslated,
  startTranslation,
}: {
  story: {
    id: number;
    title: string;
    url: string;
  };
  translated: boolean;
  startTranslation: boolean;
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedJustNow, setTranslatedJustNow] = useState(false);

  const translate = async () => {
    setIsTranslating(true);
    try {
      const response = await fetch("/api/news/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId: story.id }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      setTranslatedJustNow(true);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const translated = wasTranslated || translatedJustNow;

  useEffect(() => {
    if (!translated && startTranslation) {
      translate();
    }
  }, [translate, translated, startTranslation]);

  return (
    <div className="grid grid-cols-[80px_1fr_120px_100px] gap-4 px-4 py-3 items-center hover:bg-gray-50">
      <div className="text-gray-600">#{story.id}</div>
      <div className="font-medium truncate" title={story.title}>
        {story.title}
      </div>
      <div className={translated ? "text-green-600" : "text-red-600"}>
        {translated ? "✅ Translated" : "❌ Not Translated"}
      </div>
      <div>
        <button
          onClick={translate}
          disabled={isTranslating || translated}
          className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
      </div>
    </div>
  );
};
