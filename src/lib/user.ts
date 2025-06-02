import { routeLoader$ } from "@builder.io/qwik-city";
import type { User } from "@supabase/supabase-js";

export const useUser = routeLoader$((req) => {
  return req.sharedMap.get('user') as User | null;
})

export const useRequiredUser = routeLoader$((req) => {
  const user = req.sharedMap.get('user') as User | null;
  if (!user) throw req.redirect(302, '/auth')
  return user
})

