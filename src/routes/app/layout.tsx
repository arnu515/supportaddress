import {
  Slot,
  component$,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useRequiredUser } from "~/lib/user";
import styles from "./layout.css?inline";
import { Link } from "@builder.io/qwik-city";

export { useRequiredUser } from "~/lib/user";

export default component$(() => {
  useRequiredUser();
  useStylesScoped$(styles);

  const sidebarOpen = useSignal(true);
  const orgDropdownOpen = useSignal(false);

  return (
    <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <nav class="fixed top-0 right-0 left-0 z-30 flex h-12 items-center gap-4 border-b border-gray-200 bg-gray-100 px-4 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90 dark:text-white">
        <button
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
        </button>

        <p class="mx-auto max-w-[50%] truncate text-center text-sm font-medium">
          Organisation Name
        </p>
      </nav>

      <main class="pt-12">
        <aside
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
                Organisation Name
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
              <li>
                <Link href="/app/org-1" class="active">
                  Org 1
                </Link>
              </li>
              <li>
                <Link href="/app/org-1">Org 1</Link>
              </li>
              <li>
                <Link href="/app/org-1">Org 1</Link>
              </li>
              <li>
                <Link href="/app/org-1">Org 1</Link>
              </li>
            </ul>
          </div>

          <h3 class="black:text-gray-600 mx-4 text-sm font-bold text-gray-400 uppercase">
            Subgroups
          </h3>
          <ul class="subgroup-list overflow-auto">
            <li>
              <Link href="/app/org-1/subgroup-1" class="active">
                Subgroup 1
              </Link>
            </li>
            <li>
              <Link href="/app/org-1/subgroup-2">Subgroup 2</Link>
            </li>
          </ul>

          <ul class="subgroup-list mt-auto mb-4">
            <li>
              <Link
                href="/app/org-1/subgroup-1"
                class="active !flex items-center gap-2"
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
                href="/app/org-1/subgroup-2"
                class="!flex items-center gap-2"
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
        </aside>
        <div
          class={`transition-all duration-300 ${sidebarOpen.value ? "open" : "closed"}`}
        >
          <Slot />
        </div>
      </main>
    </div>
  );
});
