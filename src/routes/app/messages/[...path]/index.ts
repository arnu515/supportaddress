import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = (req) => {
  throw req.error(502, "Not implemented. Ran out of time :(");
};
