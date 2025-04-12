import { ReactNode } from "react";
export interface Message {
  role: "user" | "assistant";
  content: string;
  isOptimistic?: boolean;
}
export type Buffer = {
  text: string; //缓存text
  state: boolean; // 是否开启缓存
  single: boolean;
  tag: string | ReactNode; // MARKDOWN TAG
  tagName: string | ReactNode; // HTML TAG
  classNames: string;
};

export type Roles = {
  TAG: string;
  SINGLE: boolean | "3";
  TAGNAME: string | string[];
  CLASSNAME: string;
};
