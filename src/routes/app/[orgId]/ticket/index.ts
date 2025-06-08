import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = (req) => {
  throw req.redirect(303, "/app/" + req.params.orgId);
};
