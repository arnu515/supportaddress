import { component$, $ } from "@builder.io/qwik";

export const Email = component$(
  ({
    orgId,
    subgroupId,
    subgroupHasDescription,
  }: {
    orgId: string;
    subgroupId?: string;
    subgroupHasDescription?: boolean;
  }) => {
    const email = `${orgId}${subgroupId ? "+" + subgroupId : ""}@support.aarnavpai.in`;
    const copyEmail$ = $(() => {
      if (
        "clipboard" in navigator &&
        typeof navigator.clipboard.writeText === "function"
      )
        navigator.clipboard.writeText(email);
      else {
        const input = document.createElement("input");
        input.value = email;
        document.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      alert("Copied email to clipboard!");
    });

    return (
      <section class="m-4 mx-auto flex max-w-screen-md flex-col items-center justify-center gap-4 border border-gray-200 bg-gray-50 px-6 py-4 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
        <h3 class="text-center text-2xl font-bold">Your SupportAddress</h3>
        <p class="text-center text-lg font-medium text-gray-700 dark:text-gray-300">
          Provide the below SupportAddress to your customers so they can send
          support tickets to you.
        </p>
        <pre
          id="email-box"
          title="Click to Copy"
          class="w-max cursor-pointer border border-gray-500 bg-white px-4 py-2 text-center font-mono text-lg dark:bg-gray-900"
          onClick$={copyEmail$}
        >
          {email}
        </pre>
        {subgroupId && (
          <p class="text-center text-gray-500">
            Alternatively, use{" "}
            <code class="border border-gray-500 bg-white p-1 font-mono dark:bg-gray-900">
              {orgId}@support.aarnavpai.in
            </code>{" "}
            for an organisation-wide email.{" "}
            {subgroupHasDescription &&
              "AI may sort tickets received at the organisation email address into this subgroup if possible."}
          </p>
        )}
      </section>
    );
  },
);

export const Status = ({
  status,
}: {
  status: { assigned: number; completed: number; open: number; closed: number };
}) => {
  const stats = [
    [
      "Waiting for You",
      status.assigned,
      "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        key={1}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5"
      >
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle
          cx="7.5"
          cy="7.5"
          r=".5"
          fill="currentColor"
          style="--darkreader-inline-fill: currentColor;"
          data-darkreader-inline-fill=""
        />
      </svg>,
    ],
    [
      "Completed",
      status.completed,
      "text-green-500 bg-green-100 dark:bg-green-900/30",
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        key={2}
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>,
    ],
    [
      "Total Open",
      status.open,
      "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
      <svg
        xmlns="http://www.w3.org/2000/svg"
        key={3}
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
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      </svg>,
    ],
    [
      "Total Closed",
      status.closed,
      "text-red-500 bg-red-100 dark:bg-red-900/30",
      <svg
        xmlns="http://www.w3.org/2000/svg"
        key={4}
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
        <path d="m8 11 2 2 4-4" />
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>,
    ],
  ] as const;
  return (
    <>
      <section class="my-10">
        <h2 class="my-4 text-3xl text-xl font-bold md:text-2xl">Status</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <article
              class="flex items-center justify-between gap-2 border border-gray-200 bg-gray-50 px-4 py-2 text-black backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
              key={stat[0]}
            >
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat[0]}
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat[1]}
                </p>
              </div>
              <div class={`rounded-full p-3 ${stat[2]}`}>{stat[3]}</div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};
