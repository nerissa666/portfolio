import { z } from "zod";
import { Calculator } from "./calculator.client";

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

export const execute = (args: ParamsType) => {
  return <Calculator args={args} />;
};
