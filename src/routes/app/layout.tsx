import {
  Slot,
  component$,
  useComputed$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useRequiredUser } from "~/lib/user";
import styles from "./layout.css?inline";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";
import type { Database } from "~/lib/dbTypes";

export { useRequiredUser } from "~/lib/user";

export const useOrgs = routeLoader$(async (req) => {
  const orgs: typeof data = req.sharedMap.get("orgs");
  if (orgs) return orgs;
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase.from("organisations").select("*");
  if (error) throw req.error(500, error.message);
  req.sharedMap.set("org", data);
  return data;
});

export const useCurrentOrg = routeLoader$(async (req) => {
  const user = req.sharedMap.get("user");
  if (!user) throw req.redirect(303, "/auth");
  const supabase = createSupabaseServerClient(req);
  if (req.pathname === "/app/" || req.pathname === "/app") {
    const { lastOrgId } = user.user_metadata;
    if (lastOrgId) {
      const { count, error } = await supabase
        .from("organisations")
        .select("1")
        .eq("id", lastOrgId);
      if (error) throw req.error(500, error.message);
      if (count) throw req.redirect(303, "/app/" + lastOrgId);
    }
    const { data, error } = await supabase
      .from("organisations")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (error) throw req.error(500, error.message);
    throw req.redirect(303, data ? `/app/${data.id}` : "/app/new-org");
  }

  const { orgId } = req.params;
  if (!orgId) return null;
  const org = req.sharedMap.get(
    "org",
  ) as Database["public"]["Tables"]["organisations"]["Row"];
  if (org && org.id === orgId) return org;
  const { data, error } = await supabase
    .from("organisations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
  if (error) throw req.error(500, error.message);
  if (!data) throw req.error(404, "This organisation does not exist");
  req.sharedMap.set("org", org);
  return data;
});

export const useSubgroups = routeLoader$(async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { orgId } = req.params;
  if (!orgId) return [];
  const sg = req.sharedMap.get("subgroups-" + orgId);
  if (sg) return sg as Database["public"]["Tables"]["subgroups"]["Row"][];
  const { data, error } = await supabase
    .from("subgroups")
    .select("*")
    .eq("org_id", orgId);
  if (error) throw req.error(500, error.message);
  req.sharedMap.set("subgroups-" + orgId, data);
  return data;
});

export default component$(() => {
  useRequiredUser();
  useStylesScoped$(styles);

  const orgs = useOrgs();
  const org = useCurrentOrg();
  const subgroups = useSubgroups();

  const loc = useLocation();
  const sidebarOpen = useSignal(true);
  const orgDropdownOpen = useSignal(false);

  const onNewOrg = useComputed$(() => loc.url.pathname.startsWith("/app/new-org"))

  useVisibleTask$(() => {
    sidebarOpen.value = localStorage.getItem("sidebar-open") !== 'false'
  })

  useVisibleTask$(({track}) => {
    localStorage.setItem("sidebar-open", track(() => sidebarOpen.value).toString())
  })

  return (
    <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <nav class="fixed top-0 right-0 left-0 z-30 flex h-12 items-center gap-4 border-b border-gray-200 bg-gray-100 px-4 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90 dark:text-white">
        {!onNewOrg.value &&<button
          class="cursor-pointer rounded-md border border-transparent bg-transparent p-2 transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={`size-5 ${sidebarOpen.value ? "hidden md:block" : "block"}`}
          >
            <path d="M4 12h16" />
            <path d="M4 18h16" />
            <path d="M4 6h16" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={`size-5 ${sidebarOpen.value ? "block md:hidden" : "hidden"}`}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Toggle Sidebar</span>
        </button>}

        {org.value?.name ? <p class="mx-auto max-w-[50%] truncate text-center text-sm font-medium">
          <Link href={`/app/${org.value?.id}`}>{org.value.name}</Link>
        </p> :
        <div class="flex items-center space-x-2 justify-center w-full">
          <img src="/favicon.svg" alt="Logo" class="h-6 w-6" />
          <Link href="/" class="font-bold text-white">
            SupportAddress
          </Link>
        </div>
        }
      </nav>

      <main class="pt-12">
        {!onNewOrg.value && <aside
          class={`fixed top-12 left-0 z-10 flex h-[calc(100vh-3rem)] w-64 flex-col gap-4 border-r border-gray-200 bg-gray-50 text-black backdrop-blur-sm transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white ${sidebarOpen.value ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div class="relative px-4 py-6">
            <button
              class="flex w-full cursor-pointer items-center gap-2 rounded-md border border-gray-500 bg-white px-4 py-2 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              onClick$={() => (orgDropdownOpen.value = !orgDropdownOpen.value)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-5"
              >
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                <path d="M10 6h4" />
                <path d="M10 10h4" />
                <path d="M10 14h4" />
                <path d="M10 18h4" />
              </svg>
              <span class="truncate text-sm font-medium">
                {org.value?.name || "No organisations"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="ml-auto size-4"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </button>
            <ul
              class="org-dropdown"
              style={{ display: orgDropdownOpen.value ? "block" : "none" }}
            >
              {orgs.value.map((org) => (
                <li>
                  <Link
                    href={`/app/${org.id}`}
                    class={
                      loc.url.pathname.startsWith(`/app/${org.id}`)
                        ? "active"
                        : undefined
                    }
                  >
                    {org.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {subgroups.value && (
            <>
              <h3 class="black:text-gray-600 mx-4 text-sm font-bold text-gray-400 uppercase">
                Subgroups
              </h3>
              <ul class="subgroup-list overflow-auto">
                {subgroups.value.map((sg) => (
                  <li>
                    <Link
                      href={`/app/${sg.org_id}/${sg.id}`}
                      class={
                        loc.url.pathname.startsWith(
                          `/app/${sg.org_id}/${sg.id}`,
                        )
                          ? "active"
                          : undefined
                      }
                    >
                      {sg.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <ul class="subgroup-list mt-auto mb-4">
            <li>
              <Link
                href="/app/messages"
                class={`${loc.url.pathname.startsWith("/app/messages") ? "active" : ""}!flex items-center gap-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>{" "}
                Messages
              </Link>
            </li>
            <li>
              <Link
                href="/app/settings"
                class={`${loc.url.pathname.startsWith("/app/settings") ? "active" : ""}!flex items-center gap-2`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-5"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>{" "}
                Settings
              </Link>
            </li>
          </ul>
        </aside>}
        <div
          class={`transition-all duration-300 ${!onNewOrg.value && sidebarOpen.value ? "open" : "closed"}`}
        >
          <Slot />
        </div>
      </main>
    </div>
  );
});
