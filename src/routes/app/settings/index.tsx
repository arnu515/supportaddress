import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <h1 class="mx-4 my-8 text-3xl font-bold">Settings</h1>

      <div class="mx-auto my-8 max-w-screen-md p-4">
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
