import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  zod$,
  z,
  routeLoader$,
} from "@builder.io/qwik-city";
import {
  createServiceRoleClient,
  createSupabaseServerClient,
} from "~/lib/supabase";
import styles from "./index.css?inline";
import { User } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export const useJoinOrg = routeAction$(
  async ({ code }, req) => {
    const user = req.sharedMap.get("user");
    if (!user) throw req.redirect(303, "/auth");
    const supabase = createServiceRoleClient(req.env);
    const { data, error } = await supabase
      .from("org_invites")
      .select("org_id, created_at")
      .eq("email", user.email)
      .eq("id", code)
      .maybeSingle();
    if (error) return req.fail(500, { message: error.message });
    if (!data) return req.fail(400, { message: "Invalid invite code" });
    if (Date.now() - new Date(data.created_at).getTime() > 2 * 3600 * 1000) {
      await supabase.from("org_invites").delete().eq("id", code);
      return req.fail(400, { message: "Invite code has expired" });
    }
    const { error: orgError } = await supabase
      .from("organisations_users")
      .insert({ org_id: data.org_id, user_id: user.id });
    if (orgError) return req.fail(500, { message: orgError.message });
    await supabase.from("org_invites").delete().eq("id", code);
    throw req.redirect(302, `/app/${data.org_id}`);
  },
  zod$({
    code: z
      .string()
      .length(9, "Code must be 9 letters long")
      .trim()
      .toUpperCase()
      .regex(/[A-Z0-9]+/g, "Code must consist of only alphanumeric characters"),
  }),
);

export const useCreateOrg = routeAction$(
  async ({ name, description, link }, req) => {
    const user = req.sharedMap.get("user") as User | null;
    if (!user) throw req.redirect(303, "/auth");
    const supabase = createSupabaseServerClient(req);
    const id = nanoid();
    const { error } = await supabase.from("organisations").insert({
      id,
      name,
      description: description || undefined,
      link: link || undefined,
      owner_id: user.id,
    });
    if (error) return req.fail(500, { message: error.message });
    throw req.redirect(302, "/app/" + id);
  },
  zod$({
    name: z.string().trim().min(4).max(255),
    description: z
      .string()
      .trim()
      .min(10)
      .max(1024)
      .optional()
      .or(z.literal("")),
    link: z.string().url().trim().max(255).optional().or(z.literal("")),
  }),
);

export const useCodeFromQueryString = routeLoader$((req) => {
  const data = z
    .string()
    .length(9)
    .trim()
    .toUpperCase()
    .regex(/[A-Z0-9]+/g)
    .safeParse(req.url.searchParams.get("code"));
  return data.success ? data.data : undefined;
});

export default component$(() => {
  useStylesScoped$(styles);

  // true -> join | false -> create
  const code = useCodeFromQueryString();
  const mode = useSignal(true);
  const join = useJoinOrg();
  const create = useCreateOrg();

  return (
    <div class="mx-auto max-w-screen-sm py-10">
      <Link
        href="/app/settings"
        class="mr-4 mb-8 ml-auto flex w-max items-center gap-2 text-purple-300 transition-colors duration-300 hover:text-purple-500"
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

      <section class="m-4 rounded-xl border border-purple-400/20 bg-white/5 px-6 py-8 shadow-2xl shadow-sm backdrop-blur-xl">
        <h1 class="mb-2 text-center text-2xl font-bold text-white">
          {mode.value ? "Join" : "Create"} an Organisation
        </h1>
        <p class="mx-auto mt-2 mb-4 max-w-[80%] text-center text-sm text-gray-300">
          {mode.value ? (
            <>
              If you have an organisation's invite code, enter it below.
              <br />
              If you were expecting an invite, check your email's spam folder.
            </>
          ) : (
            <>Create an organisation to start supporting your users</>
          )}
        </p>

        {join.value?.failed && join.value?.message && (
          <div class="my-4 flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
            <h3>An error occured!</h3>
            <p class="text-sm">{join.value.message}</p>
          </div>
        )}
        {create.value?.failed && create.value?.message && (
          <div class="my-4 flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
            <h3>An error occured!</h3>
            <p class="text-sm">{create.value.message}</p>
          </div>
        )}

        {mode.value ? (
          <Form class="space-y-2" action={join}>
            <div class="space-y-2">
              <div class="relative">
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
                  class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="code"
                  type="text"
                  name="code"
                  value={join.formData?.get("code") || code.value}
                  aria-label="Invite Code"
                  placeholder="Enter your invite code"
                  maxLength={9}
                  class="pl-10!"
                  required
                />
              </div>
              {join.value?.fieldErrors?.code && (
                <p class="mt-2 text-sm text-red-500">
                  {join.value.fieldErrors.code}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={join.isRunning}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
            >
              {join.isRunning && (
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
              Join Organisation
            </button>

            <button
              type="button"
              onClick$={() => (mode.value = false)}
              disabled={join.isRunning}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-300 px-4 py-2 text-white disabled:cursor-not-allowed dark:bg-gray-700"
            >
              Create an organisation
            </button>
          </Form>
        ) : (
          <Form
            class="grid grid-cols-1 gap-2 space-y-2 sm:grid-cols-2"
            action={create}
          >
            <fieldset class="space-y-2">
              <label for="name">Organisation name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Example Org"
                required
              />
              {create.value?.fieldErrors?.name && (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.name}
                </p>
              )}
            </fieldset>
            <fieldset class="space-y-2">
              <label for="link">Link (optional)</label>
              <input
                type="url"
                name="link"
                id="link"
                placeholder="https://example.org"
              />
              {create.value?.fieldErrors?.link && (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.link}
                </p>
              )}
            </fieldset>
            <fieldset class="space-y-2 md:col-span-2">
              <label for="description">Description (optional)</label>
              <textarea
                rows={3}
                name="description"
                id="description"
                placeholder="Enter something about your organisation"
              />
              {create.value?.fieldErrors?.description && (
                <p class="mt-2 text-sm text-red-500">
                  {create.value.fieldErrors.description}
                </p>
              )}
            </fieldset>

            <div class="flex flex-col items-center gap-2 md:col-span-2 md:flex-row">
              <button
                type="button"
                onClick$={() => (mode.value = true)}
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
                Create Organisation
              </button>
            </div>
          </Form>
        )}
      </section>
    </div>
  );
});
