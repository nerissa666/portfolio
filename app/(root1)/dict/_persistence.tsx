import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Function to save a query to localStorage
export function saveQuery(query: string): void {
  const queries = getQueryHistory();
  const updatedQueries = [query, ...queries.filter((q) => q !== query)];
  const trimmedQueries = updatedQueries.slice(0, 20);
  localStorage.setItem("queryHistory", JSON.stringify(trimmedQueries));
}

// Function to get query history from localStorage
export function getQueryHistory(): string[] {
  const savedQueries = localStorage.getItem("queryHistory");
  if (!savedQueries) return [];
  try {
    return JSON.parse(savedQueries);
  } catch {
    return [];
  }
}

// Function to delete a query from history
function deleteQuery(queryToDelete: string): void {
  const queries = getQueryHistory();
  const updatedQueries = queries.filter((q) => q !== queryToDelete);
  localStorage.setItem("queryHistory", JSON.stringify(updatedQueries));
}

// Function to clear all queries from history
function clearAllQueries(): void {
  localStorage.setItem("queryHistory", JSON.stringify([]));
}

// SaveQuery component
export function SaveQuery({ query }: { query: string }) {
  if (!query) return null;
  saveQuery(query);
  return null;
}

// QueryHistory component
export function QueryHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const queries = getQueryHistory();

  // Add useEffect to handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".query-history-container")) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 query-history-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-full w-10 h-10 md:w-12 md:h-12 shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 border border-gray-200 hover:shadow-xl"
      >
        <span className="text-gray-600 text-lg">🕒</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[calc(100vw-2rem)] sm:w-72 h-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
          <div className="px-3 sm:px-4 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-serif text-gray-800 text-sm sm:text-base font-medium">
              Recent Searches
            </h3>
            {queries.length > 0 && (
              <button
                onClick={() => {
                  clearAllQueries();
                  setIsOpen(false);
                  setTimeout(() => setIsOpen(true), 0);
                }}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="overflow-y-auto h-[calc(400px-57px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {queries.length === 0 ? (
              <p className="px-4 sm:px-4 py-6 text-gray-500 text-center text-sm sm:text-base">
                No recent searches
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {queries.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-4 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <a
                      href={`/dict?query=${encodeURIComponent(q)}`}
                      className="text-gray-700 hover:text-gray-900 font-serif flex-1 truncate text-sm sm:text-base hover:underline"
                    >
                      {q}
                    </a>
                    <button
                      onClick={() => {
                        deleteQuery(q);
                        setIsOpen(false);
                        setTimeout(() => setIsOpen(true), 0);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
