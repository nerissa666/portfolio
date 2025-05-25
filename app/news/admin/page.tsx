import { revalidatePath, revalidateTag } from "next/cache";
import { listAllTranslatedStories } from "@/app/db/redis";
import { translateTopStories } from "../lib/translateTopStories";
import { ErrorBoundary, Pending } from "./Pending";
import { cleanAllTranslationsAction } from "./actions";

export default async function AdminPage() {
  async function invalidateTopStories() {
    "use server";
    revalidateTag("top-stories");
  }

  async function clearTranslations() {
    "use server";
    await cleanAllTranslationsAction();
    revalidatePath("/news/admin");
  }

  async function translateStories() {
    "use server";
    await translateTopStories();
    revalidatePath("/news/admin");
  }

  const translations = await listAllTranslatedStories();
  const successfulTranslations = translations.filter(
    (story) => story.translatedContent !== "N/A"
  );
  const failedTranslations = translations.filter(
    (story) => story.translatedContent === "N/A"
  );
  const avgContentLength = Math.round(
    successfulTranslations.reduce(
      (acc, story) => acc + (story.translatedContent?.length || 0),
      0
    ) / successfulTranslations.length
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Translation Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-500 text-sm">Total Stories</h3>
          <p className="text-3xl font-semibold">{translations.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-500 text-sm">Successful Translations</h3>
          <p className="text-3xl font-semibold text-green-600">
            {successfulTranslations.length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-gray-500 text-sm">Failed Translations</h3>
          <p className="text-3xl font-semibold text-red-600">
            {failedTranslations.length}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h3 className="text-gray-500 text-sm mb-2">Average Content Length</h3>
        <p className="text-3xl font-semibold">{avgContentLength} characters</p>
      </div>

      <div className="space-y-4">
        <ErrorBoundary>
          <form action={invalidateTopStories} className="inline-block">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Invalidate Cache
              <Pending />
            </button>
          </form>
        </ErrorBoundary>

        <form action={clearTranslations} className="inline-block ml-4">
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Translations
            <Pending />
          </button>
        </form>

        <form action={translateStories} className="inline-block ml-4">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Translate Stories
            <Pending />
          </button>
        </form>
      </div>
    </div>
  );
}
