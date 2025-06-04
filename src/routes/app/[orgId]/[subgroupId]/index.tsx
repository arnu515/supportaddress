import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../../layout"; 
import { useSubgroup } from "./layout";

export default component$(() => {
  const org = useCurrentOrg()
  const user = useRequiredUser()
  const subgroup = useSubgroup()

  return <div class="p-4">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold my-6">Hello, {user.value.profile.name}!</h1>
    <p class="text-lg md:text-xl lg:text-2xl ml-4 text-gray-700 dark:text-gray-300 font-medium my-4">Welcome to <em>{subgroup.value!.name}</em> in <em>{org.value!.name}</em></p>
  </div>;
});
