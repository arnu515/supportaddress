import type { RequestHandler } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export const onRequest: RequestHandler = async (req) => {
  const supabase = createSupabaseServerClient(req);
  await supabase.auth.signOut();

  throw req.redirect(302, "/");
};
