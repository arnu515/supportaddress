import { Slot, component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export const useSubgroup = routeLoader$(async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { subgroupId } = req.params;
  const { data, error } = await supabase
    .from("subgroups")
    .select("*")
    .eq("id", subgroupId)
    .maybeSingle();
  if (error) throw req.error(500, error.message);
  if (!data) throw req.error(404, "Page not found")
  return data;
});

export default component$(() => {
  return <Slot />;
});
