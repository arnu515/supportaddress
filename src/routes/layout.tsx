import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type RequestHandler, useLocation } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";

export { useUser } from "~/lib/user";

export const onRequest: RequestHandler = async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase.auth.getSession();
  if (error) throw req.error(500, error.message);
  req.sharedMap.set("session", data.session);
  if (data.session) {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw req.error(500, error.message);
    if (data.user) {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      if (error) throw req.error(500, error.message);
      if (profile) {
        req.sharedMap.set("user", { ...data.user, profile });
        return;
      }
    }
  }
  req.sharedMap.set("user", null);
};

const NavigationProgress = component$(() => {
  const width = useSignal(0)
  const opacity = useSignal(1)
  const loc = useLocation()

  useVisibleTask$(({track}) => {
    if (track(() => loc.isNavigating)) {
      width.value = 20;
    } else {
      if (width.value !== 0) {
        width.value = 100
        setTimeout(() => {
          opacity.value = 0
          setTimeout(() => {
            width.value = 0
            setTimeout(() => {
              opacity.value = 1
            }, 200)
          }, 200)
        }, 100)
      }
    }
  })

  return <div class="fixed top-0 w-full h-1 z-50">
    <div class="w-full h-full bg-purple-500 transition-all duration-200 ease-in-out" style={{ width: width.value + '%', opacity: opacity.value }} />
  </div>
})

export default component$(() => {
  return <>
    <NavigationProgress />
    <Slot />
  </>;
});
