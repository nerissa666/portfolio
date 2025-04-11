import React, { Suspense } from "react";
import { Message } from "./types";
import { getAssitantMessageContentStream } from "./action";
export const StreamableRenderFromAsyncGenerator = async ({
  message,
  text = "", //缓存text
  state = false, // 是否开启缓存
  curSingle = "3",
  curTag = "", // MARKDOWN TAG
  curTagName = "", // HTML TAG
  classNames = "",
}: {
  message: Message;
  text?: string; //缓存text
  state?: boolean; // 是否开启缓存
  curSingle?: boolean | "3";
  curTag?: string; // MARKDOWN TAG
  curTagName?: string; // HTML TAG
  classNames?: string;
}) => {
  const g = await getAssitantMessageContentStream([message]);

  const State_Machine = ({
    text,
    state,
    preSingle,
    curSingle,
    preTag,
    curTag,
    preTagName,
    curTagName,
    classNames,
  }: {
    text: string;
    state: boolean;
    preSingle: boolean | "3";
    curSingle: boolean | "3";
    preTag: string;
    curTag: string;
    preTagName: string;
    curTagName: string;
    classNames: string;
    value: string;
  }) => {
    if (state) {
      if (preSingle) {
        const node = preTagName
          ? React.createElement(preTagName, null, text)
          : text;
        return (
          <>
            <Suspense fallback={<div>...</div>}>
              {node}
              <RenderInterator
                text={""}
                state={state}
                preSingle={curSingle}
                preTag={curTag}
                preTagName={curTagName}
                classNames={classNames}
              />
            </Suspense>
          </>
        );
      } else {
        // 判断是否相等
        if (preTag === curTag) {
          const node = React.createElement(preTagName, null, text);
          return (
            <>
              <Suspense fallback={<div>...</div>}>
                {node}
                <RenderInterator
                  text={""}
                  state={false}
                  preSingle={"3"}
                  preTag={""}
                  preTagName={""}
                  classNames={""}
                />
              </Suspense>
            </>
          );
        } else {
          return (
            <>
              <Suspense fallback={<div>...</div>}>
                {text + preTag}
                <RenderInterator
                  text={""}
                  state={true}
                  preSingle={curSingle}
                  preTag={curTag}
                  preTagName={curTagName}
                  classNames={classNames}
                />
              </Suspense>
            </>
          );
        }
      }
    } else {
      return (
        <>
          <Suspense fallback={<div>...</div>}>
            <RenderInterator
              text={text}
              state={true}
              preSingle={curSingle}
              preTag={curTag}
              preTagName={curTagName}
              classNames={classNames}
            />
          </Suspense>
        </>
      );
    }
  };
  const RenderInterator = async ({
    text = "",
    state = false,
    preSingle = "3",
    curSingle = "3",
    preTag = "",
    curTag = "",
    preTagName,
    curTagName = "",
    classNames = "",
  }: {
    text: string;
    state: boolean;
    preSingle: boolean | "3";
    curSingle?: boolean | "3";
    preTag: string;
    curTag?: string;
    preTagName: string;
    curTagName?: string;
    classNames: string;
  }) => {
    const { done, value } = await g.next();
    if (done) return <>{value}</>;
    switch (value.trim()) {
      // 单标识
      case "#":
        console.log(1111);
        console.log(state);
        [curSingle, curTagName, curTag, classNames] = [true, "h1", "#", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "##":
        [curSingle, curTagName, curTag, classNames] = [true, "h2", "##", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "###":
        [curSingle, curTagName, curTag, classNames] = [true, "h3", "###", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "####":
        [curSingle, curTagName, curTag, classNames] = [true, "h4", "####", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "#####":
        [curSingle, curTagName, curTag, classNames] = [true, "h5", "#####", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "######":
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "p",
          "######",
          "p-h6",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `-`: // 无序列表
        [curSingle, curTagName, curTag, classNames] = [true, "ul", `-`, ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `*`:
        [curSingle, curTagName, curTag, classNames] = [true, "ul", `*`, ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `+`:
        [curSingle, curTagName, curTag, classNames] = [true, "ul", `+`, ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `\t-`: // 无序子列表
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          `\t-`,
          "li-sub",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `\t*`:
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          `\t*`,
          "li-sub",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `\t+`:
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          `\t+`,
          "li-sub",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "1.": // 有序列表
        [curSingle, curTagName, curTag, classNames] = [true, "ol", "1.", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `2.`:
        [curSingle, curTagName, curTag, classNames] = [true, "ol", `2.`, ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `3.`:
        [curSingle, curTagName, curTag, classNames] = [true, "ol", `3.`, ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "\t1.": // 有序子列表
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          "\t1.",
          "li-ol",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `\t.`:
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          `\t.`,
          "li-ol",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `\t3.`:
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "li",
          `\t3.`,
          "li-ol",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case `>`: // 引用
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "p",
          `>`,
          "p-quote",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "> >": // 嵌套的引用
        [curSingle, curTagName, curTag, classNames] = [
          true,
          "p",
          "> >",
          "p-quote",
        ];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "*": // 倾斜
        [curSingle, curTagName, curTag, classNames] = [false, "i", "*", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "_": // 倾斜
        [curSingle, curTagName, curTag, classNames] = [false, "i", "_", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      case "**": // 加粗
        [curSingle, curTagName, curTag, classNames] = [false, "b", "**", ""];
        return State_Machine({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          classNames,
          value,
        });
      default:
        if (state) {
          text += value;
        }
        return (
          <>
            <Suspense fallback={<div>...</div>}>
              {state ? "" : value}
              <RenderInterator
                text={text}
                state={state}
                preSingle={preSingle}
                preTag={preTag}
                preTagName={preTagName}
                classNames={classNames}
              />
            </Suspense>
          </>
        );
    }
  };

  return (
    <RenderInterator
      text={text}
      state={state}
      preSingle={curSingle}
      preTag={curTag}
      preTagName={curTagName}
      classNames={classNames}
    />
  );
};
