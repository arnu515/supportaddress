import { RequestHandler } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export const onRequest: RequestHandler = async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(req.params.path, 10);
  if (error) throw req.error(400, error.message);
  throw req.redirect(303, data.signedUrl);
};
