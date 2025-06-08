import { component$ } from "@builder.io/qwik"; 

export default component$(() => {
  return <>
    <h1 class="mx-4 my-8 text-3xl font-bold">Settings</h1>

    <div class="max-w-screen-md mx-auto my-8 p-4">
      <div class="border border-gray-500 bg-gray-200 dark:bg-gray-700 flex rounded-xl shadow-md items-center gap-4 justify-between px-6 py-3">
        <h3 class="text-xl font-medium">Log out</h3>
        <a href="/logout" class="bg-red-500 border border-transparent rounded-md px-4 py-2 text-lg">Log out</a>
      </div>
    </div>
  </>
})
