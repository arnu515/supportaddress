import {
  NoSerialize,
  component$,
  noSerialize,
  useSignal,
} from "@builder.io/qwik";
import { RequestHandler, routeLoader$, server$ } from "@builder.io/qwik-city";
import { Database } from "~/lib/dbTypes";
import {
  createServiceRoleClient,
  createSupabaseServerClient,
} from "~/lib/supabase";
import { useRequiredUser } from "~/lib/user";
import { format } from "date-fns";
import Editor from "~/components/editor";
import sanitize from "sanitize-html";
import { useCurrentOrg } from "~/routes/app/layout";
import { Buffer } from "node:buffer";

export const useTicket = routeLoader$(async (req) => {
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase
    .from("tickets")
    .select("*, subgroups(name), messages(*)")
    .eq("id", Number(req.params.ticketId))
    .eq("org_id", req.params.orgId)
    .maybeSingle();
  if (error) throw req.error(500, error.message);
  if (!data) throw req.error(404, "Page not found");
  return data;
});

export const useMessageAttachments = routeLoader$(async (req) => {
  const ticket = await req.resolveValue(useTicket);
  const supabase = createSupabaseServerClient(req);
  return Object.fromEntries(
    await Promise.all(
      ticket.messages.map(
        async (i) =>
          [
            i.id,
            (
              await Promise.all(
                i.attachments.map(async (at) => {
                  const { data: info, error } = await supabase.storage
                    .from("attachments")
                    .info(at);
                  if (error) {
                    console.error(error);
                    return undefined;
                  }
                  return {
                    path: at,
                    name:
                      (info.metadata?.origName as string) ||
                      at.split("/").at(-1) ||
                      "Unnamed file",
                    type: info.contentType || "application/octet-stream",
                    id: info.id,
                  };
                }),
              )
            ).filter((i) => i !== undefined),
          ] as const,
      ),
    ),
  );
});

const Message = component$(
  ({
    msg,
    attachments,
  }: {
    msg: Database["public"]["Tables"]["messages"]["Row"];
    attachments: { name: string; path: string; type: string; id: string }[];
  }) => {
    return (
      <article
        class="my-4 rounded-md border border-gray-200 bg-gray-50 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
        id={`msg-${msg.id}`}
      >
        <header class="flex flex-col justify-center gap-1 rounded-tl-md rounded-tr-md border border-gray-200 bg-gray-300 px-2 py-1 dark:bg-gray-700">
          <div class="flex items-center justify-between gap-2">
            <h3 class="truncate text-lg font-medium">{msg.title}</h3>
            <span class="text-gray-500">
              {format(msg.created_at, "yyyy-MM-dd HH:mm:ss")}
            </span>
          </div>
          <p class="pl-4 text-sm text-gray-700 dark:text-gray-300">
            {msg.from_name || <em>No name</em>} &lt;<em>{msg.from_email}</em>
            &gt;
          </p>
          {msg.in_reply_to && (
            <p class="pl-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Reply:{" "}
              <a class="text-purple-500" href={`#msg-${msg.in_reply_to}`}>
                View parent message
              </a>
            </p>
          )}
        </header>
        <div
          class="px-4 py-2"
          dangerouslySetInnerHTML={sanitize(msg.text).replaceAll("\n", "<br>")}
        ></div>
        {attachments.length > 0 && (
          <footer class="flex flex-col justify-center gap-1 rounded-br-md rounded-bl-md border border-gray-200 bg-gray-300 px-2 py-1 dark:bg-gray-700">
            <h3 class="font-medium">Attached files:</h3>
            {attachments.map((file) => (
              <p class="ml-4">
                <a
                  target="_blank"
                  href={`/app/file/${file.path}`}
                  class="text-purple-500"
                >
                  {file.name}
                </a>{" "}
                <span class="text-gray-500">{file.type}</span>
              </p>
            ))}
          </footer>
        )}
      </article>
    );
  },
);

function getFileIcon(ctype: string) {
  if (ctype.startsWith("image/"))
    return (
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
        class="size-4"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <circle cx="10" cy="12" r="2" />
        <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
      </svg>
    );
  if (ctype.startsWith("video/"))
    return (
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
        class="size-4"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m10 11 5 3-5 3v-6Z" />
      </svg>
    );
  if (ctype.startsWith("text/"))
    return (
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
        class="size-4"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    );
  return (
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
      class="lucide lucide-file-icon lucide-file"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

export const onPost: RequestHandler = async (req) => {
  const user = req.sharedMap.get("user");
  if (!user) throw req.redirect(303, "/auth");
  const fd = await req.request.formData();
  let content = fd.get("content");
  if (typeof content !== "string" || content.trim().length < 20) {
    req.json(400, { message: "Please type some text (>=20 chars)" });
    return;
  }
  content = content.trim();
  let title = fd.get("title");
  if (typeof title !== "string" || title.trim().length < 4) {
    req.json(400, { message: "Please type a title (>=4 chars)" });
    return;
  }
  title = title.trim();
  const replyT = fd.get("replyTo");
  if (
    typeof replyT !== "string" ||
    (replyT.trim() && isNaN(Number(replyT.trim())))
  ) {
    req.json(400, { message: "Invalid message, please refresh the page." });
    return;
  }
  const replyTo = replyT.trim() ? Number(replyT.trim()) : undefined;

  const supabase = createSupabaseServerClient(req);
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", Number(req.params.ticketId))
    .eq("org_id", req.params.orgId)
    .maybeSingle();
  if (error) {
    req.json(500, { message: error.message });
    return;
  }
  if (!ticket) throw req.error(404, "Page not found");
  if (ticket.assigned_to && ticket.assigned_to !== user.id) {
    req.json(403, { message: "You are not assigned to this ticket." });
  }
  if (ticket.closed_at) {
    req.json(403, { message: "Cannot reply to closed ticket" });
  }

  const { data: replyMessage, error: repError } = replyTo
    ? await supabase
        .from("messages")
        .select("*")
        .eq("id", replyTo)
        .eq("ticket_id", ticket.id)
        .single()
    : { data: undefined, error: undefined };
  if (repError) {
    req.json(500, { message: repError.message });
    return;
  }

  const Headers = [];
  if (replyMessage) {
    Headers.push({ Name: "In-Reply-To", Value: replyMessage.message_id });
    Headers.push({ Name: "References", Value: replyMessage.message_id });
  }

  const res = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": req.env.get("POSTMARK_SERVER_TOKEN")!,
    },
    body: JSON.stringify({
      From: `${user.profile.name} <${ticket.org_id}${ticket.subgroup_id ? "+" + ticket.subgroup_id : ""}@aarnavpai.in>`,
      To: ticket.from_name
        ? `"${ticket.from_name}" <${ticket.from}>`
        : ticket.from,
      Subject: title,
      Headers,
      HtmlBody: content,
      TextBody: sanitize(content, { allowedAttributes: {}, allowedTags: [] }),
      ReplyTo: `${ticket.org_id}${ticket.subgroup_id ? "+" + ticket.subgroup_id : ""}@supportaddress.aarnavpai.in`,
      Attachments: await Promise.all(
        (fd.getAll("files").filter((i) => typeof i !== "string") as File[]).map(
          async (i) => ({
            Name: i.name,
            Content: Buffer.from(await i.arrayBuffer()).toString("base64"),
            ContentType: i.type || "application/octet-stream",
          }),
        ),
      ),
    }),
  });
  if (!res.ok) {
    req.json(500, { message: "Could not send email" });
    console.log(await res.text());
    return;
  }
  const { MessageID } = await res.json();

  const supabaseSR = createServiceRoleClient(req.env);
  const { error: insError, data: msg } = await supabaseSR
    .from("messages")
    .insert({
      from_email: user.email,
      message_id: MessageID + "@mtasv.net",
      org_id: ticket.org_id,
      reply_to: user.email,
      text: content,
      ticket_id: ticket.id,
      title,
      from_name: user.profile.name,
      in_reply_to: replyMessage?.id || null,
      subgroup_id: ticket.subgroup_id || null,
    })
    .select("id")
    .single();
  if (insError) {
    req.json(500, { message: insError.message });
    return;
  }

  const attachments = (
    await Promise.all(
      fd.getAll("files").map(async (attachment, i) => {
        if (typeof attachment === "string") return undefined;
        const { data, error } = await supabaseSR.storage
          .from("attachments")
          .upload(
            `/${ticket.org_id}/${ticket.id}/${msg.id}/${i}${
              "." + attachment.name.split(".").at(-1) || ""
            }`,
            attachment,
            {
              contentType: attachment.type,
              metadata: { origName: attachment.name },
            },
          );
        if (error) {
          console.error("Could not add attachment:", error);
          return undefined;
        }
        return data.path;
      }),
    )
  ).filter((i) => typeof i === "string") as string[];
  if (attachments.length > 0) {
    await supabaseSR.from("messages").update({ attachments }).eq("id", msg.id);
  }

  req.json(200, { success: true });
};

const EditBox = component$(
  ({ messages }: { messages: { id: number; title: string }[] }) => {
    const content = useSignal("");
    const title = useSignal("");
    const attachments = useSignal<{ [key: string]: NoSerialize<File> }>({});
    const replyTo = useSignal(messages.at(-1)?.["id"]?.toString());
    const loading = useSignal(false);

    return (
      <form
        class="my-4 p-4"
        preventdefault:submit
        onSubmit$={async () => {
          const fd = new FormData();
          fd.set("content", content.value.trim());
          fd.set("title", title.value.trim());
          for (const attach of Object.values(attachments.value))
            if (attach) fd.append("files", attach);
          fd.set("replyTo", replyTo.value ?? "");

          loading.value = true;
          try {
            const res = await fetch("", {
              method: "POST",
              body: fd,
              credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) alert("Error: " + data.message);
            else window.location.reload();
          } catch (e) {
            console.error(e);
            alert("Error: " + (e as any).message);
          } finally {
            loading.value = false;
          }
        }}
      >
        <h3 class="text-lg font-medium">Add a reply:</h3>
        <div class="my-4">
          <input
            class="w-full rounded-md border border-purple-400/30 bg-white/5 px-4 py-2 text-white placeholder:text-gray-400 focus:border-purple-400 focus:outline-none"
            type="text"
            aria-label="Subject"
            placeholder="Subject"
            required
            minLength={4}
            bind:value={title}
          />
        </div>
        <div class="my-4">
          <Editor onContentChange$={(c) => (content.value = c)} />
        </div>
        <div class="flex flex-wrap items-center gap-4">
          {Object.entries(attachments.value).map(
            ([id, i]) =>
              i && (
                <button
                  type="button"
                  key={id}
                  class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-500 bg-gray-300 px-2 py-1 dark:bg-gray-700"
                  title="Click to Remove"
                  onClick$={() => {
                    delete attachments.value[id];
                    attachments.value = Object.fromEntries(
                      Object.entries(attachments.value),
                    );
                  }}
                >
                  {getFileIcon(i.type)}
                  <span class="max-w-48 truncate">{i.name}</span>
                </button>
              ),
          )}
          <button
            onClick$={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.addEventListener("input", (e) => {
                const files = (e.target as HTMLInputElement)?.files;
                if (!files) return;
                let totalSize = 0;
                for (const file of Object.values(attachments.value))
                  totalSize += file?.size ?? 0;

                const f: [string, NoSerialize<File>][] = [];
                for (const file of files) {
                  if (totalSize + file.size > 9 * 1024 * 1024) {
                    alert("Max cumulative attachment size is 9 MiB");
                    break;
                  }
                  totalSize += file.size;
                  f.push([Math.random().toString(), noSerialize(file)]);
                }
                attachments.value = Object.fromEntries(
                  Object.entries(attachments.value).concat(f),
                );
              });
              input.click();
              input.remove();
            }}
            type="button"
            class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-500 bg-gray-300 px-2 py-1 dark:bg-gray-700"
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
              class="size-4"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add attachment
          </button>
        </div>
        <div class="my-4 flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
          <div class="flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start">
            <label for="reply-to" class="block text-sm font-medium">
              Replying to:
            </label>
            <select bind:value={replyTo} id="reply-to">
              {messages.map((msg) => (
                <option value={msg.id} key={msg.id}>
                  {msg.title}
                </option>
              ))}
            </select>
            <a
              href={`#msg-${replyTo.value}`}
              class="text-purple-500"
              title="Go to selected message"
            >
              Go
            </a>
          </div>
          <button
            type="submit"
            class="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-lg text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
          >
            {loading.value && (
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
            Send Reply
          </button>
        </div>
      </form>
    );
  },
);

const ToggleAssignButton = component$(({ assigned }: { assigned: boolean }) => {
  const toggleAssign = server$(async function () {
    const supabaseUser = createSupabaseServerClient(this);
    const {
      data: { user },
      error,
    } = await supabaseUser.auth.getUser();
    if (error) return error.message;
    if (!user) return "Unauthorized";
    const supabase = createServiceRoleClient(this.env);
    const { count, error: countErr } = await supabase
      .from("organisations_users")
      .select("id", { count: "exact", head: true })
      .eq("org_id", this.params.orgId)
      .eq("user_id", user.id);
    if (countErr) return countErr.message;
    if (count !== 1) return "Not in this org";
    const { data: ticket, error: ticketErr } = await supabase
      .from("tickets")
      .select(
        "id, assigned_to, organisations(owner_id), subgroup_id, closed_at",
      )
      .eq("id", Number(this.params.ticketId))
      .eq("org_id", this.params.orgId)
      .single();
    if (ticketErr) return ticketErr.message;
    if (ticket.subgroup_id) {
      const { count, error: countErr } = await supabase
        .from("subgroups_users")
        .select("id", { count: "exact", head: true })
        .eq("subgroup_id", ticket.subgroup_id)
        .eq("user_id", user.id);
      if (countErr) return countErr.message;
      if (count !== 1 && ticket.organisations.owner_id !== user.id)
        return "Not in subgroup";
    }
    if (ticket.closed_at) return "This ticket is closed.";
    if (
      ticket.assigned_to &&
      (ticket.assigned_to === user.id ||
        ticket.organisations.owner_id === user.id)
    )
      await supabase
        .from("tickets")
        .update({ assigned_to: null })
        .eq("id", ticket.id);
    else if (!ticket.assigned_to)
      await supabase
        .from("tickets")
        .update({ assigned_to: user.id })
        .eq("id", ticket.id);
    else
      return "This ticket is already assigned to someone, you cannot assign it to yourself.";
    return null;
  });

  const loading = useSignal(false);

  return (
    <button
      onClick$={async () => {
        loading.value = true;
        try {
          const v = await toggleAssign();
          if (v) alert("Error: " + v);
          else window.location.reload();
        } finally {
          loading.value = false;
        }
      }}
      class="flex w-full cursor-pointer items-center gap-2 rounded-md border border-gray-500 bg-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:brightness-75 dark:bg-gray-700"
      disabled={loading.value}
    >
      {assigned ? "Unassign" : "Assign Yourself"}
    </button>
  );
});

const CloseTicketButton = component$(() => {
  const toggleAssign = server$(async function () {
    const supabaseUser = createSupabaseServerClient(this);
    const {
      data: { user },
      error,
    } = await supabaseUser.auth.getUser();
    if (error) return error.message;
    if (!user) return "Unauthorized";
    const supabase = createServiceRoleClient(this.env);
    const { count, error: countErr } = await supabase
      .from("organisations_users")
      .select("id", { count: "exact", head: true })
      .eq("org_id", this.params.orgId)
      .eq("user_id", user.id);
    if (countErr) return countErr.message;
    if (count !== 1) return "Not in this org";
    const { data: ticket, error: ticketErr } = await supabase
      .from("tickets")
      .select(
        "id, assigned_to, organisations(owner_id), subgroup_id, from_name, from, closed_at",
      )
      .eq("id", Number(this.params.ticketId))
      .eq("org_id", this.params.orgId)
      .single();
    if (ticketErr) return ticketErr.message;
    if (ticket.subgroup_id) {
      const { count, error: countErr } = await supabase
        .from("subgroups_users")
        .select("id", { count: "exact", head: true })
        .eq("subgroup_id", ticket.subgroup_id)
        .eq("user_id", user.id);
      if (countErr) return countErr.message;
      if (count !== 1 && ticket.organisations.owner_id !== user.id)
        return "Not in subgroup";
    }
    if (ticket.closed_at) return "This ticket is closed.";
    if (
      ticket.assigned_to &&
      ticket.assigned_to !== user.id &&
      ticket.organisations.owner_id !== user.id
    )
      return "This ticket is assigned to someone else, you cannot close it.";

    const { data: profile, error: profileErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileErr) return profileErr.message;

    await supabase
      .from("tickets")
      .update({ closed_at: new Date().toISOString() })
      .eq("id", ticket.id);

    const { data: replyMessage, error: msgErr } = await supabase
      .from("messages")
      .select("id, message_id")
      .eq("ticket_id", ticket.id)
      .eq("from_email", ticket.from)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (msgErr) return msgErr.message;

    const Headers = [];
    if (replyMessage) {
      Headers.push({ Name: "In-Reply-To", Value: replyMessage.message_id });
      Headers.push({ Name: "References", Value: replyMessage.message_id });
    }

    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.env.get("POSTMARK_SERVER_TOKEN")!,
      },
      body: JSON.stringify({
        From: `${profile.name} <${this.params.orgId}${ticket.subgroup_id ? "+" + ticket.subgroup_id : ""}@aarnavpai.in>`,
        To: ticket.from_name
          ? `"${ticket.from_name}" <${ticket.from}>`
          : ticket.from,
        Subject: "Ticket has been closed",
        Headers,
        HtmlBody:
          "<p>This ticket has been <b>closed</b>. You will no longer receive updates to this ticket, and replying to this message will re-open the ticket.</p>",
        TextBody:
          "This ticket has been *closed*. You will no longer receive updates to this ticket, and replying to this message will re-open the ticket.",
        ReplyTo: `${this.params.orgId}${ticket.subgroup_id ? "+" + ticket.subgroup_id : ""}@supportaddress.aarnavpai.in`,
      }),
    });
    if (!res.ok) console.log(await res.text());
    const { MessageID } = await res.json();
    const { error: insError } = await supabase.from("messages").insert({
      from_email: user.email!,
      message_id: MessageID + "@mtasv.net",
      org_id: this.params.orgId,
      reply_to: user.email!,
      text: `<p>
          This ticket has been <b>closed</b>. You will no longer receive updates
          to this ticket, and replying to this message will re-open the ticket.
        </p>`,
      ticket_id: ticket.id,
      title: "Ticket has been closed",
      from_name: profile.name,
      in_reply_to: replyMessage?.id || null,
      subgroup_id: ticket.subgroup_id || null,
    });
    if (insError) return insError.message;
  });

  const loading = useSignal(false);

  return (
    <button
      onClick$={async () => {
        loading.value = true;
        try {
          const v = await toggleAssign();
          if (v) alert("Error: " + v);
          else window.location.reload();
        } finally {
          loading.value = false;
        }
      }}
      class="flex w-full cursor-pointer items-center gap-2 rounded-md border border-red-500 bg-red-100 bg-red-900/30 px-4 py-2 text-red-500 disabled:cursor-not-allowed disabled:brightness-75 dark:bg-gray-700"
      disabled={loading.value}
    >
      Close Ticket
    </button>
  );
});

export default component$(() => {
  const ticket = useTicket();
  const user = useRequiredUser();
  const org = useCurrentOrg();
  const attachments = useMessageAttachments();

  return (
    <div class="flex flex-col-reverse items-center gap-2 p-4 md:flex-row md:items-start">
      <div class="flex-1 md:w-8/12">
        <h1 class="text-3xl font-bold md:text-4xl lg:text-5xl">
          Ticket: {ticket.value.title}
        </h1>

        {ticket.value.messages.map((msg) => (
          <Message
            key={msg.id}
            msg={msg}
            attachments={attachments.value[msg.id] as any}
          />
        ))}
        {(!ticket.value.closed_at ||
          ticket.value.assigned_to ||
          ticket.value.assigned_to === user.value.id) && (
          <EditBox messages={ticket.value.messages} />
        )}
      </div>
      <div class="my-auto hidden h-[90%] border-l border-gray-500 md:block"></div>
      <aside class="md:w-4/12">
        <div class="max-w-sm rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-black shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
          <p>
            By: <strong>{ticket.value.from_name || ticket.value.from}</strong>
          </p>
          <p>
            At: <strong>{new Date(ticket.value.created_at).toString()}</strong>
          </p>
          <div class="my-2 flex flex-wrap items-center gap-2">
            {ticket.value.subgroups && (
              <span class="rounded-full border border-blue-500 bg-blue-100 px-2 py-1 text-sm text-blue-500 dark:bg-blue-900/30">
                {ticket.value.subgroups.name}
              </span>
            )}
            {ticket.value.closed_at && (
              <span class="rounded-full border border-red-500 bg-red-100 px-2 py-1 text-sm text-red-500 dark:bg-red-900/30">
                Closed
              </span>
            )}
            {ticket.value.assigned_to ? (
              ticket.value.assigned_to === user.value.id ? (
                <span class="rounded-full border border-purple-500 bg-purple-100 px-2 py-1 text-sm text-purple-500 dark:bg-purple-900/30">
                  Assigned to You
                </span>
              ) : (
                <span class="rounded-full border border-green-500 bg-green-100 px-2 py-1 text-sm text-green-500 dark:bg-green-900/30">
                  Assigned
                </span>
              )
            ) : (
              <span class="rounded-full border border-amber-500 bg-amber-100 px-2 py-1 text-sm text-amber-500 dark:bg-amber-900/30">
                Not Assigned
              </span>
            )}
          </div>
        </div>
        {!ticket.value.closed_at && (
          <div class="my-4 flex max-w-sm flex-col justify-center gap-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-black shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
            <h3 class="text-lg font-bold">Actions</h3>
            {!ticket.value.assigned_to && (
              <ToggleAssignButton assigned={false} />
            )}
            {ticket.value.assigned_to &&
              (ticket.value.assigned_to === user.value.id ||
                org.value?.owner_id === user.value.id) && (
                <ToggleAssignButton assigned />
              )}
            {(!ticket.value.assigned_to ||
              ticket.value.assigned_to === user.value.id ||
              org.value?.owner_id === user.value.id) && <CloseTicketButton />}
          </div>
        )}
      </aside>
    </div>
  );
});
