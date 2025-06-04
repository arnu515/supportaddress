import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../layout"; 
import OwnerActions from "./OwnerActions";

export { useInvite } from "./OwnerActions";

export default component$(() => {
  const org = useCurrentOrg()
  const user = useRequiredUser()

  return <div class="p-4">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-6">Hello, {user.value.profile.name}!</h1>
    <p class="text-lg md:text-xl lg:text-2xl ml-4 text-gray-700 dark:text-gray-300 font-medium my-4">Welcome to <em>{org.value!.name}</em></p>

    {org.value?.owner_id === user.value.id && <OwnerActions orgId={org.value.id} />}
  </div>;
});
