export interface Message {
  role: "user" | "assistant";
  content: string;
  isOptimistic?: boolean;
}

export type Roles = {
  TAG: string;
  SINGLE: boolean | "3";
  TAGNAME: string | string[];
  CLASSNAME: string;
};

export interface Params {
  text?: string; //缓存text
  state?: boolean; // 是否开启缓存
  curSingle?: boolean | "3";
  curTag?: string; // MARKDOWN TAG
  curTagName?: string | string[]; // HTML TAG
  curClass?: string;
  preClass?: string;
  preSingle?: boolean | "3";
  preTag?: string;
  preTagName?: string | string[];
  value?: string;
}

export interface MB extends Params {
  message: Message;
}
