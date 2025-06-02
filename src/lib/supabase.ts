import type {RequestEventBase} from "@builder.io/qwik-city"
import { createServerClient } from "@supabase/ssr"
import type {Database} from "./dbTypes"
import { createClient } from "@supabase/supabase-js"

export function createSupabaseServerClient({env, cookie}: {env: RequestEventBase["env"], cookie: RequestEventBase["cookie"]}, {serviceRole=false}: {serviceRole?: boolean} = {}) {
  return createServerClient<Database>(
    env.get("PUBLIC_SUPABASE_URL")!,
    serviceRole ? env.get("SUPABASE_SERVICE_ROLE_KEY")! : env.get("PUBLIC_SUPABASE_ANON_KEY")!,
    {
      cookies: {
        getAll: () => Object.entries(cookie.getAll()).map(([k, {value}]) => ({ name: k, value })),
        setAll: (cookies) => cookies.forEach(({name, value, options}) => cookie.set(name, value, options))
      }
    }
  )
}

export function createServiceRoleClient(env: RequestEventBase["env"]) {
  return createClient<Database>(
    env.get("PUBLIC_SUPABASE_URL")!,
    env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )
}
