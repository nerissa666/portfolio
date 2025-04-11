"use server";

import { LanguageModelV1, streamText } from "ai";
import { Message, MessageDB, GeneratorWithID, G } from "./types";
import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { ReactNode, Suspense } from "react";
import { GET_NEXT_STATE } from "./GET_NEXT_STATE";
import { State } from "./GET_NEXT_STATE";
import connect from "./mongoose";
import Post from "./Post";

export const createPost = async function (title: string, content: string) {
  await connect();
  const newPost = new Post({
    title,
    content,
  });
  await newPost.save();
  return newPost;
};

export const getPosts = async function (_id?: string) {
  await connect();
  const posts = _id ? await Post.findById(_id) : await Post.find();
  return _id ? posts : JSON.stringify(posts);
};
export const updatePosts = async function (_id: string, content: string) {
  await connect();
  const updatedPost = await Post.findByIdAndUpdate(
    _id,
    { content },
    { new: true }
  );

  if (!updatedPost) {
  } else {
  }
  return JSON.stringify(updatedPost);
};
export const getTextStreamFromMongodb = async () => {
  const resGet = JSON.parse(await getPosts());
  return [
    resGet.map((message: MessageDB) => (
      <div key={Date.now() * Math.random()}>
        <div>{message.title}</div>
        <Suspense fallback={<div>Loading...</div>}>{message.content}</Suspense>
      </div>
    )),
  ];
};
const getTextStream = async (messages: Message[]) => {
  const { textStream } = await streamText({
    model: deepseek("deepseek-chat") as LanguageModelV1,
    messages,
  });

  return textStream;
};

const getAssistantMessageContentStream = async (
  messages: Message[]
): Promise<GeneratorWithID> => {
  const textStream = await getTextStream(messages);
  const reader = textStream.getReader();
  const _newPost = await createPost(messages[0].content, " ");
  async function* generateText() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  }

  return { generator: generateText(), id: _newPost._id };
};

export const getMessageReactNode = async (message: Message) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StreamableRenderFromMessage message={message} />
    </Suspense>
  );
};

const StreamableRenderFromMessage = async ({
  message,
}: {
  message: Message;
}) => {
  const { generator, id } = await getAssistantMessageContentStream([message]);
  let remainingChars = "";
  // TODO: instead of getting next char, which turns every single
  // char into a react node, we should get the next token
  const getNextChar = async (): Promise<string | null> => {
    if (remainingChars.length > 0) {
      const nextChar = remainingChars[0];
      remainingChars = remainingChars.slice(1);
      return nextChar;
    }

    const { done, value } = await generator.next();
    updatePosts(id, (await getPosts(id)).content + value);

    if (done) return null;

    if (value.length > 1) {
      remainingChars = value.slice(1);
      return value[0];
    }
    return value;
  };

  let buffer: ReactNode = null;
  let currentState: State = "INITIAL";

  const RecursivelyRender = async () => {
    const nextChar = await getNextChar();
    const nextState = GET_NEXT_STATE(currentState, nextChar, buffer);
    buffer = nextState.nextBuffer;
    currentState = nextState.nextState;

    if (currentState === "COMPLETED") {
      return <>{nextState.flushPayload}</>;
    }
    if (nextState.flushPayload) {
      return (
        <>
          {nextState.flushPayload}
          <Suspense fallback={<div>...</div>}>
            <RecursivelyRender />
          </Suspense>
        </>
      );
    } else {
      // BUFFER
      return <RecursivelyRender />;
    }
  };

  return <RecursivelyRender />;
};
