import { component$ } from "@builder.io/qwik"
import { Link, routeLoader$ } from "@builder.io/qwik-city"
import { createSupabaseServerClient } from "~/lib/supabase"
import { useUser } from "~/lib/user"

export const useTickets = routeLoader$(async (req) => {
  const supabase = createSupabaseServerClient(req)
  const subgroupId = req.params.subgroupId
  if (!subgroupId) {
    const {data: tickets, error} = await supabase.from('tickets')
    .select('*, messages(count), subgroups(name)')
    .eq("org_id", req.params.orgId)
    .is("subgroup_id", null)
    if (error) throw req.error(500, error.message)
    return tickets
  } else {
  const {data: tickets, error} = await supabase.from('tickets')
    .select('*, messages(count), subgroups(name)')
    .eq("org_id", req.params.orgId)
    .eq("subgroup_id", subgroupId)
    if (error) throw req.error(500, error.message)
    return tickets
  }
})

export const TicketList = component$(({tickets}: {tickets: ReturnType<typeof useTickets>['value']}) => {
  const user = useUser()
  return <section class="my-10">
    <h2 class="my-4 text-3xl text-xl font-bold md:text-2xl">
      Tickets
    </h2>
    <div class="flex flex-col gap-4 justify-center">
      {tickets.length >0 ? tickets.map(ticket => <Link href={`/app/${ticket.org_id}/ticket/${ticket.id}`}><article class="gap-2 justify-between px-4 py-2 border-gray-200 bg-gray-50 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white border rounded-md shadow-sm">
        <h3 class="text-xl font-medium my-2">{ticket.title}</h3>
        <p class="text-gray-500 text-sm my-1">By: {ticket.from_name || ticket.from} | At: {new Date(ticket.created_at).toString()}</p>
        <div class="flex items-center flex-wrap gap-2 my-2">
          {ticket.subgroups && <span class="text-sm border-blue-500 text-blue-500 bg-blue-100 dark:bg-blue-900/30 border rounded-full px-2 py-1">{ticket.subgroups.name}</span>}
          {ticket.closed_at && <span class="text-sm border-red-500 text-red-500 bg-red-100 dark:bg-red-900/30 border rounded-full px-2 py-1">Closed</span>}
          {ticket.assigned_to && ticket.assigned_to === user.value?.id ? <span class="text-sm border-amber-500 text-amber-500 bg-amber-100 dark:bg-amber-900/30 border rounded-full px-2 py-1">Assigned to You</span> : <span class="text-sm border-green-500 text-green-500 bg-green-100 dark:bg-green-900/30 border rounded-full px-2 py-1">Assigned</span>}
        </div>
      </article></Link>) : <p class="text-gray-500 text-lg m-4">No tickets yet.</p>}
    </div>
  </section>
})
