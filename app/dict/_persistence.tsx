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
        className="bg-white rounded-full w-10 h-10 md:w-12 md:h-12 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
      >
        <span className="text-gray-600">🕒</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[calc(100vw-2rem)] sm:w-64 max-h-[60vh] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-serif text-gray-800 text-sm sm:text-base">
              Recent Searches
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[50vh]">
            {queries.length === 0 ? (
              <p className="p-4 text-gray-500 text-center text-sm sm:text-base">
                No recent searches
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {queries.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50"
                  >
                    <a
                      href={`/dict?query=${encodeURIComponent(q)}`}
                      className="text-gray-700 hover:text-gray-900 font-serif flex-1 truncate text-sm sm:text-base"
                    >
                      {q}
                    </a>
                    <button
                      onClick={() => {
                        deleteQuery(q);
                        setIsOpen(false);
                        setTimeout(() => setIsOpen(true), 0);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500"
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
