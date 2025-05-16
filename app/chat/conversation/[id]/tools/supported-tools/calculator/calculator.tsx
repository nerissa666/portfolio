import { z } from "zod";
import type { ExecuteFunction } from "../tools";
import { ReactNode } from "react";

const paramsSchema = z.object({
  a: z.number(),
  b: z.number(),
  operation: z.enum(["add", "subtract", "multiply", "divide"]).default("add"),
});

export type ParamsType = z.infer<typeof paramsSchema>;

export const specs = {
  description: "A tool to perform arithmetic operations on two numbers",
  parameters: paramsSchema,
};

export const execute: ExecuteFunction<ParamsType> = ({
  args,
  completeToolCallRsc,
}) => {
  return (
    <div>
      <CalculatorBase args={args} completeToolCallRsc={completeToolCallRsc} />
    </div>
  );
};

const CalculatorBase = async ({
  args,
  completeToolCallRsc,
}: {
  args: ParamsType;
  completeToolCallRsc: (result: unknown) => Promise<ReactNode>;
}) => {
  const { a, b, operation } = args;
  let result: number;
  let operationSymbol: string;

  switch (operation) {
    case "add":
      result = a + b;
      operationSymbol = "+";
      break;
    case "subtract":
      result = a - b;
      operationSymbol = "-";
      break;
    case "multiply":
      result = a * b;
      operationSymbol = "×";
      break;
    case "divide":
      result = a / b;
      operationSymbol = "÷";
      break;
    default:
      result = a + b;
      operationSymbol = "+";
  }

  const node = await completeToolCallRsc(result);

  return (
    <>
      {node}
      <div className="p-4 border rounded-md bg-gray-900 shadow-md animate-fadeIn max-w-xs">
        <h3 className="text-lg font-medium mb-2 text-white">Calculator</h3>
        <div className="bg-gray-800 p-3 rounded-md mb-3 text-right text-white">
          <div className="text-sm text-gray-400 mb-1">
            {a} {operationSymbol} {b}
          </div>
          <div className="text-2xl font-bold animate-numberGrow">{result}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button className="calc-btn col-span-2 bg-gray-700">AC</button>
          <button className="calc-btn bg-gray-700">DEL</button>
          <button
            className={`calc-btn bg-amber-500 ${
              operation === "divide" ? "ring-2 ring-white" : ""
            }`}
          >
            ÷
          </button>

          <button className="calc-btn bg-gray-600">7</button>
          <button className="calc-btn bg-gray-600">8</button>
          <button className="calc-btn bg-gray-600">9</button>
          <button
            className={`calc-btn bg-amber-500 ${
              operation === "multiply" ? "ring-2 ring-white" : ""
            }`}
          >
            ×
          </button>

          <button className="calc-btn bg-gray-600">4</button>
          <button className="calc-btn bg-gray-600">5</button>
          <button className="calc-btn bg-gray-600">6</button>
          <button
            className={`calc-btn bg-amber-500 ${
              operation === "subtract" ? "ring-2 ring-white" : ""
            }`}
          >
            -
          </button>

          <button className="calc-btn bg-gray-600">1</button>
          <button className="calc-btn bg-gray-600">2</button>
          <button className="calc-btn bg-gray-600">3</button>
          <button
            className={`calc-btn bg-amber-500 ${
              operation === "add" ? "ring-2 ring-white" : ""
            }`}
          >
            +
          </button>

          <button className="calc-btn col-span-2 bg-gray-600">0</button>
          <button className="calc-btn bg-gray-600">.</button>
          <button className="calc-btn bg-amber-500">=</button>
        </div>
        <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes numberGrow {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.7s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        .animate-numberGrow {
          animation: numberGrow 0.8s ease-out forwards;
          animation-delay: 0.6s;
          opacity: 0;
        }
        .calc-btn {
          padding: 0.5rem;
          border-radius: 0.375rem;
          color: white;
          font-weight: 500;
          transition: all 0.2s;
        }
        .calc-btn:hover {
          opacity: 0.8;
          transform: scale(0.98);
        }
      `}</style>
      </div>
    </>
  );
};
