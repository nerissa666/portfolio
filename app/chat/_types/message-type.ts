export interface IMessage {
  role: "system" | "user" | "assistant";
  content: string;
  mode?: string;
}
