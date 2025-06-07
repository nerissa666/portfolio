import { z } from "zod";
import type { ExecuteFunction } from "../tools";

/**
 * Example interaction:
 * User: "How do you pronounce 'ephemeral'?"
 * AI: Let me help you with that pronunciation.
 * [Tool shows pronunciation with audio and phonetic spelling]
 */

// 1. Parameter Schema
const paramsSchema = z.object({
  word: z.string().min(1).max(50).describe("The word to get pronunciation for"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

// 2. Tool Specifications
export const specs = {
  description: "Get the pronunciation and phonetic spelling of a word",
  parameters: paramsSchema,
};

// 3. Execute Function
export const execute: ExecuteFunction<ParamsType> = async ({
  args,
  completeToolCallRsc,
}) => {
  const { word } = args;

  try {
    // Fetch pronunciation data from Free Dictionary API
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
        word
      )}`
    );

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    const pronunciation = data[0]?.phonetic || data[0]?.phonetics[0]?.text;
    const audioUrl = data[0]?.phonetics[0]?.audio;

    // Store the result
    const node = await completeToolCallRsc({
      word,
      pronunciation,
      audioUrl,
    });

    return (
      <>
        {node}
        <div className="p-4 border rounded-md shadow-md">
          <h3 className="text-xl font-semibold text-white mb-2">{word}</h3>
          <p className="text-gray-300 mb-4">Phonetic: {pronunciation}</p>
          {audioUrl && (
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </>
    );
  } catch (error: unknown) {
    console.error("Error fetching pronunciation:", error);
    return (
      <div className="p-4 border rounded-md bg-red-900/50 text-white">
        Sorry, I couldn&apos;t find the pronunciation for &quot;{word}&quot;.
        Please check if the word is spelled correctly.
      </div>
    );
  }
};
