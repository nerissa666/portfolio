import * as calculator from "./calculator/calculator";
import * as weather from "./weather/weather";
import * as addReminder from "./(reminder)/add-reminder/add-reminder";
import * as showReminders from "./(reminder)/show-reminders/show-reminders";
import * as editReminder from "./(reminder)/edit-reminder/edit-reminder";
import * as webSearch from "./web-search/web-search";
import * as pronunciation from "./pronunciation/pronunciation";
import type { CompleteToolCallPayload } from "@/app/db/redis";
import type { ReactNode } from "react";

// TODO: add more tools

export const TOOLS = {
  calculator: calculator.specs,
  weather: weather.specs,
  addReminder: addReminder.specs,
  showReminders: showReminders.specs,
  editReminder: editReminder.specs,
  webSearch: webSearch.specs,
  pronunciation: pronunciation.specs,
} as const;

// Execute function can return a React node, and it will be displayed
// at the same time the tool call happens. We eventually use saveToolCallResult
// to save the result of the tool call, and move the AI to the next state.
export const EXECUTE_TOOLS: Record<keyof typeof TOOLS, ExecuteFunction<any>> = {
  calculator: calculator.execute,
  weather: weather.execute,
  webSearch: webSearch.execute,
  showReminders: showReminders.execute,
  addReminder: addReminder.execute,
  editReminder: editReminder.execute,
  pronunciation: pronunciation.execute,
} as const;

export type ExecuteFunction<ParamsType> = (props: {
  args: ParamsType;
  completeToolCallServerAction: (
    payload: CompleteToolCallPayload
  ) => Promise<ReactNode>;
  completeToolCallRsc: (result: unknown) => Promise<ReactNode>;
}) => ReactNode;
