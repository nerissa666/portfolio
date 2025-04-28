import * as calculator from "./calculator";

// TODO: add more tools

export const TOOLS = {
  calculator: calculator.specs,
} as const;

export const EXECUTE_TOOLS = {
  calculator: calculator.execute,
} as const;
