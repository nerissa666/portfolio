// A new block is typically separated by a newline, unless
// it's inside a code block or table, in which case the whole code block
// or table is considered a single block.

// This function yields a single block at a time from the AI's response.
export const createMarkdownBlockGeneratorFromLlmReader = (
  reader: ReadableStreamDefaultReader<string>
) => {
  const generator = async function* () {
    // We maintain state about the current block being built and whether we're in special blocks
    let currentBlock = "";
    let insideCodeBlock = false;
    let insideTable = false;

    // Example input stream:
    // "Here is some text\n```js\nconst x = 1;\n```\nMore text"
    // Will yield blocks:
    // 1. "Here is some text"
    // 2. "```js\nconst x = 1;\n```"
    // 3. "More text"

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Process each character individually
      for (const char of value) {
        if (char === "`" && currentBlock.endsWith("``")) {
          // Found a code block marker
          if (insideCodeBlock) {
            // Closing code block
            currentBlock += char;
            yield currentBlock;
            currentBlock = "";
            insideCodeBlock = false;
          } else {
            // Opening code block
            // First yield any accumulated regular text
            if (currentBlock && !currentBlock.endsWith("``")) {
              yield currentBlock;
              currentBlock = "";
            }
            currentBlock += char;
            insideCodeBlock = true;
          }
        } else if (char === "|" && !insideCodeBlock) {
          // Potential table marker
          if (!insideTable) {
            // Starting a potential table
            // First yield any accumulated regular text
            if (currentBlock && !currentBlock.trim().endsWith("|")) {
              yield currentBlock;
              currentBlock = "";
            }
            insideTable = true;
          }
          currentBlock += char;
        } else if (char === "\n" && insideTable) {
          // In a table
          currentBlock += char;
          if (!currentBlock.trim().endsWith("|")) {
            // If line doesn't end with |, it's not a table row
            insideTable = false;
            yield currentBlock;
            currentBlock = "";
          }
        } else if (char === "\n" && !insideCodeBlock && !insideTable) {
          // Line break outside special blocks - yield current block
          if (currentBlock) {
            yield currentBlock;
            currentBlock = "";
          }
        } else {
          // Add character to current block
          currentBlock += char;
        }
      }
    }

    // Yield final block if anything remains
    if (currentBlock) {
      yield currentBlock;
    }
  };

  return generator();
};
