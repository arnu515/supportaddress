import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export { useUser, type User } from "~/lib/user";

export const onRequest: RequestHandler = async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase.auth.getSession();
  if (error) throw req.error(500, error.message);
  req.sharedMap.set("session", data.session);
  if (data.session) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw req.error(500, error.message);
    if (data.user) {
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", data.user.id).maybeSingle()
      if (error) throw req.error(500, error.message);
      if (profile) {
        req.sharedMap.set("user", { ...data.user, profile } satisfies User);
        return;
      }
    }
  }
  req.sharedMap.set("user", null);
};

export default component$(() => {
  return <Slot />;
});
