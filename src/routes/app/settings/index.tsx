import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1 class="mx-4 my-8 flex items-center justify-center gap-4 text-center text-3xl font-bold">
        <Link
          href="/app"
          class="inline-block rounded-full p-3"
          title="Back"
          aria-label="Back"
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
            class="size-7"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </Link>
        Settings
      </h1>

      <div class="mx-auto my-4 max-w-screen-md p-4">
        <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-500 bg-gray-200 px-6 py-3 shadow-md dark:bg-gray-700">
          <h3 class="text-xl font-medium">Create/Join an organisation</h3>
          <Link
            href="/app/new-org"
            class="rounded-md border border-transparent bg-purple-100 px-4 py-2 text-lg text-purple-500 dark:bg-purple-900/30"
          >
            New Organisation
          </Link>
        </div>
      </div>

      <div class="mx-auto my-4 max-w-screen-md p-4">
        <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-500 bg-gray-200 px-6 py-3 shadow-md dark:bg-gray-700">
          <h3 class="text-xl font-medium">Log out</h3>
          <a
            href="/logout"
            class="rounded-md border border-transparent bg-red-500 px-4 py-2 text-lg"
          >
            Log out
          </a>
        </div>
      </div>
    </>
  );
});
