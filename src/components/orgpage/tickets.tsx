import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import { createSupabaseServerClient } from "~/lib/supabase";
import { useUser } from "~/lib/user";

// eslint-disable-next-line qwik/loader-location
export const useTickets = routeLoader$(async (req) => {
  const supabase = createSupabaseServerClient(req);
  const subgroupId = req.params.subgroupId;
  if (!subgroupId) {
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*, messages(count), subgroups(name)")
      .eq("org_id", req.params.orgId)
      .is("subgroup_id", null);
    if (error) throw req.error(500, error.message);
    return tickets;
  } else {
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*, messages(count), subgroups(name)")
      .eq("org_id", req.params.orgId)
      .eq("subgroup_id", subgroupId);
    if (error) throw req.error(500, error.message);
    return tickets;
  }
});

export const TicketList = component$(
  ({ tickets }: { tickets: ReturnType<typeof useTickets>["value"] }) => {
    const user = useUser();
    return (
      <section class="my-10">
        <h2 class="my-4 text-3xl text-xl font-bold md:text-2xl">Tickets</h2>
        <div class="flex flex-col justify-center gap-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Link href={`/app/${ticket.org_id}/ticket/${ticket.id}`}>
                <article
                  class="justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-black shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                  key={ticket.id}
                >
                  <h3 class="my-2 text-xl font-medium">{ticket.title}</h3>
                  <p class="my-1 text-sm text-gray-500">
                    By: {ticket.from_name || ticket.from} | At:{" "}
                    {new Date(ticket.created_at).toString()}
                  </p>
                  <div class="my-2 flex flex-wrap items-center gap-2">
                    {ticket.subgroups && (
                      <span class="rounded-full border border-blue-500 bg-blue-100 px-2 py-1 text-sm text-blue-500 dark:bg-blue-900/30">
                        {ticket.subgroups.name}
                      </span>
                    )}
                    {ticket.closed_at && (
                      <span class="rounded-full border border-red-500 bg-red-100 px-2 py-1 text-sm text-red-500 dark:bg-red-900/30">
                        Closed
                      </span>
                    )}
                    {ticket.assigned_to &&
                    ticket.assigned_to === user.value?.id ? (
                      <span class="rounded-full border border-amber-500 bg-amber-100 px-2 py-1 text-sm text-amber-500 dark:bg-amber-900/30">
                        Assigned to You
                      </span>
                    ) : (
                      <span class="rounded-full border border-green-500 bg-green-100 px-2 py-1 text-sm text-green-500 dark:bg-green-900/30">
                        Assigned
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <p class="m-4 text-lg text-gray-500">No tickets yet.</p>
          )}
        </div>
      </section>
    );
  },
);
