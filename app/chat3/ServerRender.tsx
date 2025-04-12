import React, { Suspense } from "react";
import { Message } from "./types";
import { getAssitantMessageContentStream } from "./action";
import { ROLES_LIST } from "./md-roles";
export const StreamableRenderFromAsyncGenerator = async ({
  message,
  text = "", //缓存text
  state = false, // 是否开启缓存
  curSingle = "3",
  curTag = "", // MARKDOWN TAG
  curTagName = "", // HTML TAG
  curClass = "",
}: {
  message: Message;
  text?: string; //缓存text
  state?: boolean; // 是否开启缓存
  curSingle?: boolean | "3";
  curTag?: string; // MARKDOWN TAG
  curTagName?: string; // HTML TAG
  curClass?: string;
  preClass?: string;
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
    curClass,
    preClass,
  }: {
    text: string;
    state: boolean;
    preSingle: boolean | "3";
    curSingle: boolean | "3";
    preTag: string;
    curTag: string;
    preTagName: string | Array<string>;
    curTagName: string | Array<string>;
    curClass?: string;
    preClass?: string;
    value: string;
  }) => {
    if (state) {
      if (preSingle) {
        const node = preTagName
          ? Array.isArray(preTagName)
            ? React.createElement(
                preTagName[0],
                { className: preClass },
                React.createElement(preTagName[1], null, text)
              )
            : React.createElement(preTagName, { className: preClass }, text)
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
                preClass={curClass}
              />
            </Suspense>
          </>
        );
      } else {
        // 判断是否相等
        if (
          preTag === curTag ||
          preTag === curTag.split("").reverse().join("")
        ) {
          // console.log(preTag, curTag.split("").reverse().join(""));
          const node = Array.isArray(preTagName)
            ? React.createElement(
                preTagName[0],
                { className: preClass },
                React.createElement(preTagName[1], null, text)
              )
            : React.createElement(preTagName, { className: preClass }, text);
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
                  preClass={""}
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
                  preClass={curClass}
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
              preClass={curClass}
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
    curClass = "",
    preClass = "",
  }: {
    text: string;
    state: boolean;
    preSingle: boolean | "3";
    curSingle?: boolean | "3";
    preTag: string;
    curTag?: string;
    preTagName: string | string[];
    curTagName?: string | string[];
    curClass?: string;
    preClass?: string;
  }) => {
    const { done, value } = await g.next();
    if (done) return <>{value}</>;
    const mapActions = new Map();
    ROLES_LIST.map((item) => {
      mapActions.set(
        item.TAG,
        ({
          text,
          state,
          preSingle,
          curSingle,
          preTag,
          curTag,
          preTagName,
          curTagName,
          curClass,
          preClass,
          value,
        }: {
          text: string;
          state: boolean;
          preSingle: boolean | "3";
          curSingle?: boolean | "3";
          preTag: string;
          curTag?: string;
          preTagName: string | string[];
          curTagName?: string | string[];
          curClass?: string;
          preClass?: string;
          value: string;
        }) => {
          [curSingle, curTagName, curTag, curClass] = [
            item.SINGLE,
            item.TAGNAME,
            item.TAG,
            item.CLASSNAME,
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
            curClass,
            preClass,
            value,
          });
        }
      );
    });
    mapActions.set(
      "default",
      ({
        state,
        value,
        text,
        preSingle,
        preTag,
        preTagName,
        preClass,
      }: {
        state: boolean;
        value: string;
        text: string;
        preSingle: boolean | "3";
        preTag: string;
        preTagName: string | string[];
        preClass: string;
      }) => {
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
                preClass={preClass}
              />
            </Suspense>
          </>
        );
      }
    );
    return (mapActions.get(value) || mapActions.get("default"))({
      curSingle,
      curTagName,
      curTag,
      curClass,
      state,
      value,
      text,
      preSingle,
      preTag,
      preTagName,
      preClass,
    });
  };

  return (
    <Suspense fallback={<div>...</div>}>
      <RenderInterator
        text={text}
        state={state}
        preSingle={curSingle}
        preTag={curTag}
        preTagName={curTagName}
        preClass={curClass}
      />
    </Suspense>
  );
};
