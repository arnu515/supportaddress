import type {RequestEventBase} from "@builder.io/qwik-city"
import { createServerClient } from "@supabase/ssr"

export function createSupabaseServerClient(req: RequestEventBase, {serviceRole=false}: {serviceRole?: boolean} = {}) {
  return createServerClient(
    req.env.get("PUBLIC_SUPABASE_URL")!,
    serviceRole ? req.env.get("SUPABASE_SERVICE_ROLE_KEY")! : req.env.get("PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll: () => Object.entries(req.cookie.getAll()).map(([k, {value}]) => ({ name: k, value })),
        setAll: (cookies) => cookies.forEach(({name, value, options}) => req.cookie.set(name, value, options))
      }
    }
  )
}
