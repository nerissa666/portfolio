import { Roles } from "./types";
export const ROLES_LIST: Roles[] = [
  {
    TAG: "#",
    SINGLE: true,
    TAGNAME: "h1",
    CLASSNAME: "",
  },
  {
    TAG: "##",
    SINGLE: true,
    TAGNAME: "h2",
    CLASSNAME: "",
  },
  {
    TAG: "###",
    SINGLE: true,
    TAGNAME: "h3",
    CLASSNAME: "",
  },
  {
    TAG: "####",
    SINGLE: true,
    TAGNAME: "h4",
    CLASSNAME: "",
  },
  {
    TAG: "#####",
    SINGLE: true,
    TAGNAME: "h5",
    CLASSNAME: "",
  },
  {
    TAG: "######",
    SINGLE: true,
    TAGNAME: "p",
    CLASSNAME: "color-gray-500 font-normal text-[14px]",
  },
  {
    TAG: "-",
    SINGLE: true,
    TAGNAME: "ul",
    CLASSNAME: "",
  },
  {
    TAG: "*",
    SINGLE: true,
    TAGNAME: "ul",
    CLASSNAME: "",
  },
  {
    TAG: "+",
    SINGLE: true,
    TAGNAME: "ul",
    CLASSNAME: "",
  },
  {
    TAG: "\t-",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-sub",
  },
  {
    TAG: "\t*",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-sub",
  },
  {
    TAG: "\t+",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-sub",
  },
  {
    TAG: "1.",
    SINGLE: true,
    TAGNAME: "ol",
    CLASSNAME: "",
  },
  {
    TAG: "2.",
    SINGLE: true,
    TAGNAME: "ol",
    CLASSNAME: "",
  },
  {
    TAG: "3.",
    SINGLE: true,
    TAGNAME: "ol",
    CLASSNAME: "",
  },
  {
    TAG: "\t1.",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-ol",
  },
  {
    TAG: "\t.",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-ol",
  },
  {
    TAG: "\t3.",
    SINGLE: true,
    TAGNAME: "li",
    CLASSNAME: "li-ol",
  },
  {
    TAG: ">",
    SINGLE: true,
    TAGNAME: "p",
    CLASSNAME: "p-require",
  },
  {
    TAG: "> >",
    SINGLE: true,
    TAGNAME: "p",
    CLASSNAME: "p-require",
  },
  {
    TAG: "*", //斜体
    SINGLE: false,
    TAGNAME: "i",
    CLASSNAME: "",
  },
  {
    TAG: "__",
    SINGLE: false,
    TAGNAME: "b",
    CLASSNAME: "",
  },
  {
    TAG: "**",
    SINGLE: false,
    TAGNAME: "strong",
    CLASSNAME: "",
  },
  {
    TAG: "_",
    SINGLE: false,
    TAGNAME: "em",
    CLASSNAME: "",
  },
  {
    TAG: "***",
    SINGLE: false,
    TAGNAME: ["b", "i"],
    CLASSNAME: "",
  },
  {
    TAG: "___",
    SINGLE: false,
    TAGNAME: ["strong", "em"],
    CLASSNAME: "",
  },
  {
    TAG: "**_", //粗斜体
    SINGLE: false,
    TAGNAME: ["strong", "em"],
    CLASSNAME: "",
  },
  {
    TAG: "__*", //粗斜体
    SINGLE: false,
    TAGNAME: ["b", "i"],
    CLASSNAME: "",
  },
  {
    TAG: "~~",
    SINGLE: false,
    TAGNAME: "s", // del
    CLASSNAME: "",
  },
  {
    TAG: "`",
    SINGLE: false,
    TAGNAME: "mark", // del
    CLASSNAME: "",
  },
  {
    TAG: "```",
    SINGLE: false, // 还应该有种类型 是block 必须要wait 到下一个```` 才算结束，直到最后 而不是遇到任意一个都被结束
    TAGNAME: "p", // del
    CLASSNAME: "p-fragment",
  },
  // {
  //   TAG: "/[^([^]]+)]/g",
  //   SINGLE: true,
  //   TAGNAME: "sup", // del
  //   CLASSNAME: "",
  // },
  // 表格 链接[链接文本](链接地址) 图片 引用 代码块 注脚sup[^1] 缩进
  // ![图片替代文本](图片链接地址) \[\^([^\]]+)\]
];
