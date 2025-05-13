import { z } from "zod";
import Exa from "exa-js";
import Collapsable from "./collapsable.client";
import { Suspense } from "react";

// Initialize Exa client
const exa = new Exa(process.env.EXA_AI_API_KEY);

interface SearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

const paramsSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(100)
    .describe("The search query to find information on the web"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description: "Access real-time data",
  parameters: paramsSchema,
};

export async function execute(
  args: ParamsType,
  saveToolCallResult: <T>(result: T) => void
) {
  try {
    const Component = async () => {
      const { results } = await exa.searchAndContents(args.query, {
        livecrawl: "always",
        numResults: 10, // Increased from 3 to 5 results
      });

      const searchResults: SearchResult[] = results.map(
        (result: Record<string, any>) => ({
          title: result.title,
          url: result.url,
          content: result.text.slice(0, 1500), // Increased from 1000 to 1500 characters
          publishedDate: result.publishedDate,
        })
      );

      // Save the results
      saveToolCallResult(searchResults);

      // Return a formatted display of the results
      return (
        <Collapsable title={"Search results for " + args.query}>
          <div className="space-y-4">
            {searchResults.map((result: SearchResult, index: number) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg shadow border border-blue-100"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {result.title}
                  </a>
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {result.publishedDate
                    ? new Date(result.publishedDate).toLocaleDateString()
                    : "Date unknown"}
                </p>
                <p className="text-gray-700">{result.content}</p>
              </div>
            ))}
          </div>
        </Collapsable>
      );
    };

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4 space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span>Searching results for "{args.query}"...</span>
          </div>
        }
      >
        <Component />
      </Suspense>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to perform web search";
    saveToolCallResult({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
}
