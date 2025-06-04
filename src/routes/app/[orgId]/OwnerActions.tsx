import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik"
import { Form, Link, routeAction$, zod$, z } from "@builder.io/qwik-city"
import styles from '../new-org/index.css?inline'
import { createSupabaseServerClient } from "~/lib/supabase"
import { customAlphabet } from "nanoid"

export const useInvite = routeAction$(async ({email, message}, req) => {
  const user = req.sharedMap.get('user')
  if (!user) throw req.redirect(303, '/auth')
  if (user.email === email) return req.fail(500, { message: "You cannot invite yourself" })
  const supabase = createSupabaseServerClient(req)
  const {data: org, error} = await supabase.from('organisations').select('id, name, owner_id').eq('id', req.params.orgId).maybeSingle()
  if (error) return req.fail(500, { message: error.message })
  if (!org || org.owner_id !== user.id) return req.fail(403, { message: 'forbidden' })
  const code = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")(9)
  const {error: cError} = await supabase.from('org_invites').insert({
    id: code,
    email,
    org_id: org.id,
    message: message || undefined,
  })
  if (cError) return req.fail(500, { message: cError.message })

  const res = await fetch("https://api.postmarkapp.com/email/withTemplate", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": req.env.get('POSTMARK_SERVER_TOKEN')!,
    },
    body: JSON.stringify({
      From: 'support@aarnavpai.in',
      To: email,
      TemplateAlias: 'user-invitation',
      TemplateModel: {
        org_name: org.name,
        invitee: user.profile.name,
        message,
        code
      }
    })
  })
  if (res.status !== 200) return req.fail(res.status, { message: await res.text() })
}, zod$({   
    email: z
      .string()
      .email("Please enter a valid email.")
      .min(4, "Must be atleast 4 characters long.")
      .max(255, "May only be upto 255 characters long.")
      .trim(),
    message: z.string().trim().max(1024).optional().or(z.literal(''))
}))

export default component$(({orgId}: {orgId: string}) => {
  useStylesScoped$(styles)

  const showInviteForm = useSignal(false)
  const invite = useInvite()
  
  return <section class="my-10">
    <h2 class="my-4 text-xl md:text-2xl text-3xl font-bold">Organisation Actions</h2>
    <div class="grid grid-cols-1 gap-4">
      {!showInviteForm.value ? 
        <button onClick$={() => showInviteForm.value = true} class="flex items-center gap-4 border border-gray-500 rounded shadow-sm px-4 py-2 bg-gray-100 dark:bg-gray-800 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Invite a user
        </button> :
        <Form class="max-w-screen-sm bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-6 py-4"
          action={invite}
          onSubmitCompleted$={(e) => {
            if (!e.detail.value?.failed) {
              showInviteForm.value = false
              alert("Invited user successfully")
            }
          }}>
          {invite.value?.failed && invite.value?.message && (
            <div class="my-4 flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
              <h3>An error occured!</h3>
              <p class="text-sm">{invite.value.message}</p>
            </div>
          )}
          <h3 class="text-xl my-4 font-bold">Invite a user</h3>
          <p class="text-lg my-4">Enter the user's email to invite them</p>
            <div class="space-y-2">
              <label for="email">Email</label>
              <input type="email" name="email" id="email" placeholder="someone@example.org" />
              {invite.value?.fieldErrors?.email && (
                <p class="mt-2 text-sm text-red-500">
                  {invite.value.fieldErrors.email}
                </p>
              )}
            </div>
            <div class="space-y-2 mt-2">
              <label for="email">Message (optional)</label>
              <textarea rows={3} name="message" id="message" placeholder="Enter a message to send to them" />
              {invite.value?.fieldErrors?.message && (
                <p class="mt-2 text-sm text-red-500">
                  {invite.value.fieldErrors.message}
                </p>
              )}
            </div>
            <div class="flex items-center justify-end mt-2 gap-2">
              <button
                onClick$={() => showInviteForm.value = false}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-white disabled:cursor-not-allowed dark:bg-gray-800"
              disabled={invite.isRunning}
                >
                Cancel
              </button>
            <button
              type="submit"
              disabled={invite.isRunning}
              class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
            >
              {invite.isRunning && (
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
              Invite
            </button>
            </div>
        </Form>}
      <Link class="flex items-center gap-4 border border-gray-500 rounded shadow-sm px-4 py-2 bg-gray-100 dark:bg-gray-800" href={`/app/${orgId}/new-subgroup`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        Create a subgroup
      </Link>
    </div>

  </section>
})
