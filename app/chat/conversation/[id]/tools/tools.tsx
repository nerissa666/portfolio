import * as calculator from "./calculator";
import * as weather from "./weather";

// TODO: add more tools

export const TOOLS = {
  calculator: calculator.specs,
  weather: weather.specs,
} as const;

// Execute function can return a React node, and it will be displayed
// at the same time the tool call happens. We eventually use saveToolCallResult
// to save the result of the tool call, and move the AI to the next state.
export const EXECUTE_TOOLS = {
  calculator: calculator.execute,
  weather: weather.execute,
} as const;
