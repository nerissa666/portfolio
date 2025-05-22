import { MarkdownParser } from "@/app/chat/conversation/[id]/markdown-parser";
import Link from "next/link";
import { getAndCacheTranslatedStory } from "../lib/getAndCacheTranslatedStory";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RenderStory id={id} />;
}

const RenderStory = async ({ id }: { id: string }) => {
  "use cache";
  cacheLife({
    revalidate: 86400 * 30,
  });

  const story = await getAndCacheTranslatedStory(id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/news"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 text-sm font-medium"
        // @ts-expect-error - unstable_dynamicOnHover is not part of the public types
        unstable_dynamicOnHover={true}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to News
      </Link>

      <article className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <header className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold leading-tight mb-4 text-gray-900">
              {story.translatedTitle}
            </h1>
          </header>

          <div className="prose prose-lg max-w-none font-serif text-gray-700 leading-relaxed">
            <MarkdownParser content={story.translatedContent} />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Read Original Article
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
};
