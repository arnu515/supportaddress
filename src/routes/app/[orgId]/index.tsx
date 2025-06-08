import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../layout";
import OwnerActions from "./OwnerActions";
import { routeLoader$ } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";
import { Email, Status } from "~/components/orgpage";
import { TicketList, useTickets } from "~/components/orgpage/tickets";

export { useInvite } from "./OwnerActions";
export { useTickets };

export const useStatus = routeLoader$(async (req) => {
  const user = req.sharedMap.get("user");
  if (!user) throw req.redirect(303, "/auth");
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase
    .from("tickets")
    .select("closed_at, assigned_to")
    .eq("org_id", req.params.orgId);
  if (error) throw req.error(500, error.message);

  let assigned = 0,
    completed = 0,
    open = 0,
    closed = 0;

  for (const ticket of data) {
    if (ticket.assigned_to && ticket.closed_at) completed++, closed++;
    else if (ticket.assigned_to && !ticket.closed_at) assigned++, open++;
    else if (!ticket.assigned_to && ticket.closed_at) closed++;
    else if (!ticket.assigned_to && !ticket.closed_at) open++;
  }

  return { assigned, completed, open, closed };
});

export default component$(() => {
  const org = useCurrentOrg();
  const user = useRequiredUser();
  const status = useStatus();
  const tickets = useTickets();

  return (
    <div class="p-4">
      <h1 class="my-6 text-3xl font-bold md:text-4xl lg:text-5xl">
        Hello, {user.value.profile.name}!
      </h1>
      <p class="my-4 ml-4 text-lg font-medium text-gray-700 md:text-xl lg:text-2xl dark:text-gray-300">
        Welcome to <em>{org.value!.name}</em>
      </p>
      {org.value?.description && (
        <p class="my-4 ml-4 text-gray-500">
          <em>{org.value.description}</em>
        </p>
      )}

      <Email orgId={org.value!.id} />

      <Status status={status.value} />

      <TicketList tickets={tickets.value} />

      {org.value?.owner_id === user.value.id && (
        <OwnerActions orgId={org.value.id} />
      )}
    </div>
  );
});
