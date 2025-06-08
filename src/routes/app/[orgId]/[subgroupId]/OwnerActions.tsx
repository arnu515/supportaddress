import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import styles from "../../new-org/index.css?inline";
import { createServiceRoleClient, createSupabaseServerClient } from "~/lib/supabase";

export const useAddUser = routeAction$(
  async ({ email }, req) => {
    const user = req.sharedMap.get("user");
    if (!user) throw req.redirect(303, "/auth");
    if (user.email === email)
      return req.fail(500, { message: "You cannot add yourself" });
    const supabase = createServiceRoleClient(req.env);
    const { data: addee, error } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", email)
      .maybeSingle();
    if (error) return req.fail(500, { message: error.message });
    if (!addee) return req.fail(400, { message: "This user is not in this organisation. Invite them first." });
    const { count, error: countErr } = await supabase.from("organisations_users").select("id", { count: 'exact', head: true }).eq("org_id", req.params.orgId).eq("user_id", addee.id)
    if (countErr) return req.fail(500, { message: countErr.message });
    if (count !== 1) return req.fail(400, { message: "This user is not in this organisation. Invite them first." });
    const { error: sError } = await supabase.from("subgroups_users").insert({
      subgroup_id: req.params.subgroupId,
      user_id: addee.id
    });
    if (sError) return req.fail(500, { message: sError.message });
    return { name: addee.name }
  },
  zod$({
    email: z
      .string()
      .email("Please enter a valid email.")
      .min(4, "Must be atleast 4 characters long.")
      .max(255, "May only be upto 255 characters long.")
      .trim(),
  }),
);

export default component$(() => {
  useStylesScoped$(styles);

  const showAddForm = useSignal(false);
  const addUser = useAddUser();

  return (
    <section class="my-10">
      <h2 class="my-4 text-3xl text-xl font-bold md:text-2xl">
        Subgroup Actions
      </h2>
      <div class="grid grid-cols-1 gap-4">
        {!showAddForm.value ? (
          <button
            onClick$={() => (showAddForm.value = true)}
            class="flex cursor-pointer items-center gap-4 rounded border border-gray-500 bg-gray-100 px-4 py-2 shadow-sm dark:bg-gray-800"
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            Add a user
          </button>
        ) : (
          <Form
            class="max-w-screen-sm bg-gray-300 px-6 py-4 text-black dark:bg-gray-700 dark:text-white"
            action={addUser}
            onSubmitCompleted$={(e) => {
              console.log(e.detail)
              if (e.detail.value && !e.detail.value.failed) {
                showAddForm.value = false;
                alert(`Added ${e.detail.value?.name || "user"} successfully`);
              }
            }}
          >
            {addUser.value?.failed && addUser.value?.message && (
              <div class="my-4 flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
                <h3>An error occured!</h3>
                <p class="text-sm">{addUser.value.message}</p>
              </div>
            )}
            <h3 class="my-4 text-xl font-bold">Add a user</h3>
            <p class="my-4 text-lg">Enter the user's email to add them to this subgroup. The user must already be in your organisation.</p>
            <div class="space-y-2">
              <label for="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="someone@example.org"
              />
              {addUser.value?.fieldErrors?.email && (
                <p class="mt-2 text-sm text-red-500">
                  {addUser.value.fieldErrors.email}
                </p>
              )}
            </div>
            <div class="mt-2 flex items-center justify-end gap-2">
              <button
                onClick$={() => (showAddForm.value = false)}
                class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-white disabled:cursor-not-allowed dark:bg-gray-800"
                disabled={addUser.isRunning}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addUser.isRunning}
                class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
              >
                {addUser.isRunning && (
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
                Add User
              </button>
            </div>
          </Form>
        )}
      </div>
    </section>
  );
});
