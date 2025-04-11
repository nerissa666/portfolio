export interface Message {
  role: "user" | "assistant";
  content: string;
  isOptimistic?: boolean;
}
export interface MessageDB extends Message {
  _id: string;
  content: string;
  title: string;
}
export interface G {
  id: string;
  generator: AsyncGenerator<string>;
}
export type GeneratorWithID = {
  generator: AsyncGenerator<string>;
  id: string;
};
