import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../../layout";
import { useSubgroup } from "./layout";
import OwnerActions from "./OwnerActions";
import { Email, Status } from "~/components/orgpage";
import { routeLoader$ } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";
import { TicketList, useTickets } from "~/components/orgpage/tickets";

export { useAddUser } from "./OwnerActions";
export { useTickets };

export const useStatus = routeLoader$(async (req) => {
  const user = req.sharedMap.get("user");
  if (!user) throw req.redirect(303, "/auth");
  const supabase = createSupabaseServerClient(req);
  const { data, error } = await supabase
    .from("tickets")
    .select("closed_at, assigned_to")
    .eq("org_id", req.params.orgId)
    .eq("subgroup_id", req.params.subgroupId);
  if (error) throw req.error(500, error.message);

  let assigned = 0,
    completed = 0,
    open = 0,
    closed = 0;

  for (const ticket of data) {
    if (ticket.assigned_to && ticket.closed_at) {
      completed++;
      closed++;
    } else if (ticket.assigned_to && !ticket.closed_at) {
      assigned++;
      open++;
    } else if (!ticket.assigned_to && ticket.closed_at) closed++;
    else if (!ticket.assigned_to && !ticket.closed_at) open++;
  }

  return { assigned, completed, open, closed };
});

export default component$(() => {
  const org = useCurrentOrg();
  const user = useRequiredUser();
  const subgroup = useSubgroup();
  const status = useStatus();
  const tickets = useTickets();

  return (
    <div class="p-4">
      <h1 class="my-6 text-3xl font-bold md:text-4xl lg:text-5xl">
        Hello, {user.value.profile.name}!
      </h1>
      <p class="my-4 ml-4 text-lg font-medium text-gray-700 md:text-xl lg:text-2xl dark:text-gray-300">
        Welcome to <em>{subgroup.value!.name}</em> in <em>{org.value!.name}</em>
      </p>
      {subgroup.value?.description && (
        <p class="my-4 ml-4 text-gray-500">
          <em>{subgroup.value.description}</em>
        </p>
      )}

      <Email orgId={org.value!.id} subgroupId={subgroup.value.id} />

      <Status status={status.value} />

      <TicketList tickets={tickets.value} />

      {org.value?.owner_id === user.value.id && <OwnerActions />}
    </div>
  );
});
