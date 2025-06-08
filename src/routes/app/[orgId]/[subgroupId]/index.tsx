import { component$ } from "@builder.io/qwik";
import { useCurrentOrg, useRequiredUser } from "../../layout";
import { useSubgroup } from "./layout";

export default component$(() => {
  const org = useCurrentOrg();
  const user = useRequiredUser();
  const subgroup = useSubgroup();

  return (
    <div class="p-4">
      <h1 class="my-6 text-3xl font-bold md:text-4xl lg:text-5xl">
        Hello, {user.value.profile.name}!
      </h1>
      <p class="my-4 ml-4 text-lg font-medium text-gray-700 md:text-xl lg:text-2xl dark:text-gray-300">
        Welcome to <em>{subgroup.value!.name}</em> in <em>{org.value!.name}</em>
      </p>
      {subgroup.value?.description && <p class="ml-4 my-4 text-gray-500"><em>{subgroup.value.description}</em></p>}
    </div>
  );
});
