import * as calculator from "./calculator";
import * as weather from "./weather";
import * as addReminder from "./add-reminder";
import * as showReminders from "./show-reminders";
import * as editReminder from "./edit-reminder";
import * as webSearch from "./web-search";

// TODO: add more tools

export const TOOLS = {
  calculator: calculator.specs,
  weather: weather.specs,
  addReminder: addReminder.specs,
  showReminders: showReminders.specs,
  editReminder: editReminder.specs,
  webSearch: webSearch.specs,
} as const;

// Execute function can return a React node, and it will be displayed
// at the same time the tool call happens. We eventually use saveToolCallResult
// to save the result of the tool call, and move the AI to the next state.
export const EXECUTE_TOOLS = {
  calculator: calculator.execute,
  weather: weather.execute,
  addReminder: addReminder.execute,
  showReminders: showReminders.execute,
  editReminder: editReminder.execute,
  webSearch: webSearch.execute,
} as const;
