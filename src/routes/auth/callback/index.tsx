import type { RequestHandler } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export const onGet: RequestHandler = async (req) => {
  const code = req.url.searchParams.get("code");
  const supabase = createSupabaseServerClient(req);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) throw req.redirect(303, "/app");
    throw req.error(500, error.message);
  }
  const error_code = req.url.searchParams.get("error_code");
  if (error_code) {
    const error_description = req.url.searchParams.get("error_description");
    throw req.error(400, `${error_code}: ${error_description}`);
  }
  throw req.redirect(303, "/");
};
