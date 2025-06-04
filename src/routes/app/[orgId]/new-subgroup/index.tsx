import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Form, Link, routeAction$, zod$, z, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";
import styles from "../../new-org/index.css?inline";
import { User } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { useCurrentOrg } from "../../layout";

export const useIsOwnerGuard = routeLoader$(async (req) => {
  const user = req.sharedMap.get('user') as User | null
  if (!user) throw req.redirect(303, '/auth')
  const org = await req.resolveValue(useCurrentOrg);
  if (!org) throw req.redirect(303, '/app')
  if (org.owner_id !== user.id) throw req.error(404, "Page not found")
})

export const useCreateSubgroup = routeAction$(async ({name, description, link}, req) => {
  const user = req.sharedMap.get('user') as User | null
  if (!user) throw req.redirect(303, '/auth')
  const {orgId} = req.params
  const supabase = createSupabaseServerClient(req)
  const id = nanoid()
  const {error} = await supabase.from("subgroups").insert({
    id,
    name,
    description: description || undefined,
    link: link || undefined,
    org_id: orgId,
    owner_id: user.id
  })
  if (error) return req.fail(500, {message: error.message})
  throw req.redirect(302, `/app/${orgId}/${id}`)
}, zod$({
  name: z.string().trim().min(4).max(255),
  description: z.string().trim().min(10).max(1024).optional().or(z.literal('')),
  link: z.string().url().trim().max(255).optional().or(z.literal(''))
}))

export default component$(() => {
  useStylesScoped$(styles);
  useIsOwnerGuard();
  
  const create = useCreateSubgroup()
  const nav = useNavigate()

  return (
    <div class="mx-auto max-w-screen-sm py-10">
      <Link
        href="/app/settings"
        class="mb-8 ml-auto mr-4 flex w-max items-center gap-2 text-purple-300 transition-colors duration-300 hover:text-purple-500"
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
        </svg>
        Settings
      </Link>

      <section class="rounded-xl border border-purple-400/20 bg-white/5 px-6 py-8 shadow-2xl shadow-sm backdrop-blur-xl m-4">
        <h1 class="mb-2 text-center text-2xl font-bold text-white">
          Create a Subgroup
        </h1>
        <p class="mx-auto mt-2 mb-4 max-w-[80%] text-center text-sm text-gray-300">
          Create a subgroup in this organisation to organise support tickets and agents.
        </p>

        {create.value?.failed && create.value?.message && (
          <div class="my-4 flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
            <h3>An error occured!</h3>
            <p class="text-sm">{create.value.message}</p>
          </div>
        )}

          <Form class="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2" action={create}>
            <fieldset class="space-y-2">
              <label for="name">Subgroup name</label>
              <input type="text" name="name" id="name" placeholder="Example Subgroup" required />
              {create.value?.fieldErrors?.name && (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.name}
                </p>
              )}
            </fieldset>
            <fieldset class="space-y-2">
              <label for="link">Link (optional)</label>
              <input type="url" name="link" id="link" placeholder="https://sub.example.org" />
              {create.value?.fieldErrors?.link && (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.link}
                </p>
              )}
            </fieldset>
            <fieldset class="space-y-2 md:col-span-2">
              <label for="description">Description (optional)</label>
              <textarea rows={3} name="description" id="description" placeholder="This subgroup is about ..." />
              {create.value?.fieldErrors?.description&& (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.description}
                </p>
              )}
              <p class="text-gray-500"><small class="text-sm">Providing a helpful description will enable AI to automatically sort support tickets as they come in.</small></p>
            </fieldset>

            <div class="flex flex-col md:flex-row md:col-span-2 items-center gap-2">
            <button
              type="button"
              onClick$={() => nav(-1)}
              disabled={create.isRunning}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-300 px-4 py-2 text-white disabled:cursor-not-allowed dark:bg-gray-700"
            >
              Go back
            </button>

            <button
              type="submit"
              disabled={create.isRunning}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
            >
              {create.isRunning && (
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
                  class="size-5 animate-spin"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}{" "}
              Create
            </button>
              </div>
          </Form>
      </section>
    </div>
  );
});
