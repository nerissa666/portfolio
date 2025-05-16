interface SearchResult<T> {
  item: T;
  score: number;
}

/**
 * Simple fuzzy search implementation
 * @param items Array of items to search through
 * @param query Search query
 * @param getText Function to get the text to search from an item
 * @returns Array of items with their match scores
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getText: (item: T) => string
): SearchResult<T>[] {
  const normalizedQuery = query.toLowerCase();

  return items
    .map((item) => {
      const text = getText(item).toLowerCase();
      const score = calculateMatchScore(text, normalizedQuery);
      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate how well a text matches a query
 * Higher score means better match
 * @param text Text to search in
 * @param query Search query
 * @returns Score between 0 and 1
 */
function calculateMatchScore(text: string, query: string): number {
  if (!query) return 0;

  // Exact match gets highest score
  if (text === query) return 1;

  // Contains the query as a substring
  if (text.includes(query)) return 0.8;

  // Check for word matches
  const queryWords = query.split(/\s+/);
  const textWords = text.split(/\s+/);

  let wordMatches = 0;
  for (const queryWord of queryWords) {
    if (textWords.some((textWord) => textWord.includes(queryWord))) {
      wordMatches++;
    }
  }

  // If all query words are found, give a good score
  if (wordMatches === queryWords.length) return 0.6;

  // Partial word matches
  let charMatches = 0;
  let queryIndex = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      charMatches++;
      queryIndex++;
    }
  }

  // Calculate score based on how many characters matched
  return (charMatches / query.length) * 0.4;
}
