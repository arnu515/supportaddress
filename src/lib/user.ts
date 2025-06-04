import { routeLoader$ } from "@builder.io/qwik-city";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Database } from "./dbTypes";

export type User = SupabaseUser & { profile: Database["public"]["Tables"]["users"]["Row"] }

export const useUser = routeLoader$((req) => {
  return req.sharedMap.get('user') as User | null;
})

export const useRequiredUser = routeLoader$((req) => {
  const user = req.sharedMap.get('user') as User | null;
  if (!user) throw req.redirect(302, '/auth')
  return user
})

