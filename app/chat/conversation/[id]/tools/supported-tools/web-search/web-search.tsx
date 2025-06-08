import { z } from "zod";
import { tavily } from "@tavily/core";
import { Suspense } from "react";
import Collapsable from "@/app/components/collapsable.client";
import { ExecuteFunction } from "../tools";

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

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

export const execute: ExecuteFunction<ParamsType> = async ({
  args,
  completeToolCallRsc,
}) => {
  try {
    const Component = async () => {
      const searchResponse = await tvly.search(args.query, {});
      const results = searchResponse.results as TavilySearchResult[];

      const searchResults: SearchResult[] = results.map(
        (result: TavilySearchResult) => ({
          title: result.title || "",
          url: result.url,
          content: result.content.slice(0, 1500),
          publishedDate: result.published_date,
        })
      );

      // Save the results
      const node = await completeToolCallRsc(searchResults);

      // Return a formatted display of the results
      return (
        <>
          {node}

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
        </>
      );
    };

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4 space-x-2">
            <div>
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
            <span>Searching results for &quot;{args.query}&quot;...</span>
          </div>
        }
      >
        <Component />
      </Suspense>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to perform web search";
    await completeToolCallRsc({ error: errorMessage });
    return <div className="text-red-500">{errorMessage}</div>;
  }
};
