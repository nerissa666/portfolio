"use client";

import { useEffect, useState } from "react";
import {
  getExistingStoryIds,
  revalidateAndGetTopStories,
  translateSingleStory,
} from "./actions";

export default function AdminPage() {
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
    <div>
      <div>
        <button onClick={() => setStartTranslation(true)}>
          Translate All Stories
        </button>
      </div>
      {topStories.map((story) => (
        <StoryAction
          key={story.id}
          story={story}
          translated={existingStoryIds.includes(story.id)}
          startTranslation={startTranslation}
        />
      ))}
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
    await translateSingleStory(story.id);
    setIsTranslating(false);
    setTranslatedJustNow(true);
  };
  const translated = wasTranslated || translatedJustNow;

  useEffect(() => {
    if (!translated) {
      translate();
    }
  }, [translate, translated]);
  return (
    <div>
      {story.id} {translated ? "✅" : "❌"}
      <button onClick={translate}>
        {isTranslating ? "Translating..." : "Translate"}
      </button>
    </div>
  );
};
