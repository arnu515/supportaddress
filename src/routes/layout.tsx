import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export { useUser } from "~/lib/user";

export const onRequest: RequestHandler = async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error) throw req.error(500, error.message);
  req.sharedMap.set("user", data.user);
};

export default component$(() => {
  return <Slot />;
});
