import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../layout";
import OwnerActions from "./OwnerActions";

export { useInvite } from "./OwnerActions";

export default component$(() => {
  const org = useCurrentOrg();
  const user = useRequiredUser();

  return (
    <div class="p-4">
      <h1 class="my-6 text-3xl font-bold md:text-4xl lg:text-5xl">
        Hello, {user.value.profile.name}!
      </h1>
      <p class="my-4 ml-4 text-lg font-medium text-gray-700 md:text-xl lg:text-2xl dark:text-gray-300">
        Welcome to <em>{org.value!.name}</em>
      </p>

      {org.value?.owner_id === user.value.id && (
        <OwnerActions orgId={org.value.id} />
      )}
    </div>
  );
});
