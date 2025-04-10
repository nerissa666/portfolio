import { ReactNode } from "react";

export type State = "INITIAL" | "COMPLETED" | "SINGLE_HASH_TAG";

type StateTransitionFunction = (
  currentState: State,
  nextChar: string | null,
  buffer: ReactNode
) => {
  flushPayload: ReactNode | null;
  nextState: State;
  nextBuffer: ReactNode;
};

export const GET_NEXT_STATE: StateTransitionFunction = (
  currentState: State,
  nextChar: string | null,
  buffer: ReactNode
) => {
  // Streaming completes, no more chars to read, so directly flush whatever we have
  if (nextChar === null) {
    return {
      flushPayload: buffer,
      nextState: "COMPLETED",
      nextBuffer: null,
    };
  }

  // First time sees "#", enter SINGLE_HASH_TAG state
  if (currentState === "INITIAL" && nextChar === "#") {
    return {
      flushPayload: null,
      nextState: "SINGLE_HASH_TAG",
      nextBuffer: null,
    };
  }

  // Handles the state transition from SINGLE_HASH_TAG
  if (currentState === "SINGLE_HASH_TAG" && nextChar !== "#") {
    if (nextChar === "\n") {
      return {
        flushPayload: <h1>{buffer}</h1>,
        nextState: "INITIAL",
        nextBuffer: null,
      };
    } else {
      return {
        flushPayload: null,
        nextState: "SINGLE_HASH_TAG",
        nextBuffer: (
          <>
            {buffer}
            {nextChar}
          </>
        ),
      };
    }
  }

  // TODO: add more cases here

  return {
    flushPayload: (
      <>
        {buffer}
        {nextChar}
      </>
    ),
    nextState: "INITIAL",
    nextBuffer: null,
  };
};
