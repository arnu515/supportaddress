import {
  component$,
  useComputed$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import {
  createServiceRoleClient,
  createSupabaseServerClient,
} from "~/lib/supabase";
import styles from "../index.css?inline";
import { Link, routeAction$, zod$, z, Form } from "@builder.io/qwik-city";
import { useUser } from "~/lib/user";

type Step =
  | ["email"]
  //       email vvvvvv
  | ["password", string]
  //  email vvvvvv
  | ["otp", string]
  //        pw-token vvvvvv
  | ["set-password", string];

const checkEmail = routeAction$(
  async ({ email }, req) => {
    const supabase = createSupabaseServerClient(req);

    const { error, data } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    console.log(error, data);
    if (error) return req.fail(500, { message: error.message });
    if (!data) {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      console.log(data);
      if (error) return req.fail(500, { message: error.message });
      return ["otp", email] as Step;
    } else {
      return ["password", email] as Step;
    }
  },
  zod$({
    email: z
      .string()
      .email("Please enter a valid email.")
      .min(4, "Must be atleast 4 characters long.")
      .max(255, "May only be upto 255 characters long.")
      .trim(),
  }),
);

const checkOtp = routeAction$(
  async ({ email, otp, name, password }, req) => {
    const supabaseAnon = createSupabaseServerClient(req);

    const { data, error: uError } = await supabaseAnon.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    if (uError) return req.fail(500, { message: uError.message });
    if (!data.user)
      return req.fail(500, { message: "Endpoint did not return a user" });

    const supabase = createServiceRoleClient(req.env);
    await supabase.auth.admin.updateUserById(data.user.id, { password });
    await supabase.auth.admin.updateUserById(
      "b171ef6c-e486-4565-a364-40df27dae289",
      { password },
    );
    const { error } = await supabase.from("users").insert({
      id: "b171ef6c-e486-4565-a364-40df27dae289",
      email,
      name,
    });
    if (error) return req.fail(500, { message: error.message });

    throw req.redirect(302, "/app");
  },
  zod$({
    email: z
      .string()
      .email("Please enter a valid email.")
      .min(4, "Must be atleast 4 characters long.")
      .max(255, "May only be upto 255 characters long.")
      .trim(),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits long")
      .regex(/^\d+$/, "OTP consists only of numbers"),
    name: z
      .string()
      .trim()
      .min(4, "Must be atleast 4 characters long")
      .max(255, "May only be upto 255 characters long."),
    password: z
      .string()
      .min(8, "Must be atleast 8 characters long")
      .max(255, "May only be upto 255 characters long."),
  }),
);

const checkPassword = routeAction$(
  async ({ email, password }, req) => {
    const supabaseAnon = createSupabaseServerClient(req);

    const { error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return req.fail(500, { message: error.message });

    throw req.redirect(302, "/app");
  },
  zod$({
    email: z
      .string()
      .email("Please enter a valid email.")
      .min(4, "Must be atleast 4 characters long.")
      .max(255, "May only be upto 255 characters long.")
      .trim(),
    password: z
      .string()
      .min(8, "Must be atleast 8 characters long")
      .max(255, "May only be upto 255 characters long."),
  }),
);

export default component$(() => {
  useStyles$(styles);

  const step = useSignal<Step>(["email"]);
  const checkEmailAction = checkEmail();
  const checkOtpAction = checkOtp();
  const checkPasswordAction = checkPassword();

  const user = useUser();

  const error = useComputed$(() => {
    if (
      checkEmailAction.value?.failed &&
      typeof checkEmailAction.value?.message === "string"
    )
      return checkEmailAction.value.message;
    if (
      checkOtpAction.value?.failed &&
      typeof checkOtpAction.value?.message === "string"
    )
      return checkOtpAction.value.message;
    if (
      checkPasswordAction.value?.failed &&
      typeof checkPasswordAction.value?.message === "string"
    )
      return checkPasswordAction.value.message;
  });

  const loading = useComputed$(
    () =>
      checkEmailAction.isRunning ||
      checkOtpAction.isRunning ||
      checkPasswordAction.isRunning,
  );

  return (
    <div class="min-h-screen py-10">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter"></div>
        <div class="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-blue-500 opacity-20 mix-blend-multiply blur-xl filter"></div>
      </div>

      <div class="relative z-10 mx-auto w-full max-w-md">
        <Link
          href="/"
          class="mb-8 flex w-max items-center gap-2 text-purple-300 transition-colors duration-300 hover:text-purple-500"
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
            class="lucide lucide-chevrons-left-icon lucide-chevrons-left"
          >
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
          Back to Home
        </Link>

        <main class="rounded-xl border border-purple-400/20 bg-white/5 px-6 py-8 shadow-2xl shadow-sm backdrop-blur-xl">
          <section class="pb-8 text-center">
            <header class="mb-8 flex items-center justify-center space-x-2">
              <img src="/favicon.svg" alt="Logo" class="h-8 w-8 rounded-lg" />
              <span class="text-xl font-bold text-white">SupportAddress</span>
            </header>
            {user.value && (
              <aside class="my-4 rounded-md border border-amber-600 bg-amber-500/20 px-4 py-2 text-gray-300 shadow-sm">
                <h3 class="text-lg">You're already logged in</h3>
                <p>
                  You are already logged into{" "}
                  <strong>{user.value.email}</strong>.{" "}
                  <Link href="/app" class="text-amber-600 underline">
                    Go to dashboard
                  </Link>
                </p>
              </aside>
            )}
            <h1 class="mb-2 text-2xl font-bold text-white">
              {step.value[0] === "email" && "Welcome back"}
              {step.value[0] === "password" && "Enter your password"}
              {step.value[0] === "otp" && "Check your email"}
            </h1>
            <p class="text-gray-300">
              {step.value[0] === "email" &&
                "Sign in to your account or create a new one"}
              {step.value[0] === "password" && (
                <>
                  Enter the password for{" "}
                  <span class="font-medium text-white">{step.value[1]}</span> in
                  the input below.
                </>
              )}
              {step.value[0] === "otp" &&
                "We've sent a verification code to your email"}
            </p>
          </section>

          <section class="space-y-6">
            {step.value[0] === "email" && (
              <div class="space-y-3">
                <button class="flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white hover:bg-gray-700">
                  <svg
                    role="img"
                    class="size-5 fill-white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>GitHub</title>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Continue with GitHub
                </button>
                <button class="flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                  <svg
                    role="img"
                    class="size-5 fill-white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Continue with Discord
                </button>

                <div class="relative mt-6 mb-4">
                  <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-transparent px-2 text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error.value && (
              <div class="flex flex-col justify-center rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-white shadow-sm">
                <h3>An error occured!</h3>
                <p class="text-sm">{error.value}</p>
              </div>
            )}

            {step.value[0] === "email" && (
              <Form
                class="space-y-4"
                action={checkEmailAction}
                onSubmitCompleted$={() => {
                  console.log(checkEmailAction.value);
                  if (Array.isArray(checkEmailAction.value))
                    step.value = checkEmailAction.value;
                }}
              >
                <div class="space-y-2">
                  <div class="relative">
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
                      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                    >
                      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={checkEmailAction.formData?.get("email")}
                      aria-label="Email"
                      placeholder="Enter your email"
                      class="w-full rounded-md border border-purple-400/30 bg-white/5 py-2 pr-4 pl-10 text-white placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />
                  </div>
                  {checkEmailAction.value?.fieldErrors?.email && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkEmailAction.value.fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading.value}
                  class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
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
                  Continue
                </button>
              </Form>
            )}

            {step.value[0] === "otp" && (
              <Form
                class="space-y-4"
                action={checkOtpAction}
                onSubmitCompleted$={(e) => {
                  console.log(e);
                }}
              >
                <div class="rounded-lg border border-purple-400/20 bg-purple-500/10 p-4 text-center">
                  <p class="text-sm text-gray-300">
                    Please enter the OTP sent to{" "}
                    <span class="font-medium text-white">{step.value[1]}</span>{" "}
                    in the input below.
                  </p>
                </div>

                <div class="space-y-2">
                  <div class="relative">
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
                      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                    >
                      <rect width="16" height="20" x="4" y="2" rx="2" />
                      <line x1="8" x2="16" y1="6" y2="6" />
                      <line x1="16" x2="16" y1="14" y2="18" />
                      <path d="M16 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M8 10h.01" />
                      <path d="M12 14h.01" />
                      <path d="M8 14h.01" />
                      <path d="M12 18h.01" />
                      <path d="M8 18h.01" />
                    </svg>
                    <input
                      id="otp"
                      type="text"
                      aria-label="Verification Code"
                      name="otp"
                      placeholder="Enter 6-digit code"
                      value={checkOtpAction.formData?.get("otp")}
                      class="w-full rounded-md border border-purple-400/30 bg-white/5 py-2 pr-4 pl-10 text-white placeholder:text-gray-400 focus:border-purple-400"
                      maxLength={6}
                      required
                    />
                  </div>
                  <input type="hidden" name="email" value={step.value[1]} />
                  {checkOtpAction.value?.fieldErrors?.otp && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkOtpAction.value.fieldErrors.otp}
                    </p>
                  )}
                  {checkOtpAction.value?.fieldErrors?.email && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkOtpAction.value.fieldErrors.email}
                    </p>
                  )}
                </div>

                <h3 class="mt-8 mb-2 text-lg font-medium text-white">
                  Account details
                </h3>

                <div class="space-y-2">
                  <label
                    for="name"
                    class="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Your Name
                  </label>
                  <div class="relative">
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
                      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                    >
                      <path d="M16 10h2" />
                      <path d="M16 14h2" />
                      <path d="M6.17 15a3 3 0 0 1 5.66 0" />
                      <circle cx="9" cy="11" r="2" />
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                    </svg>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={checkOtpAction.formData?.get("name")}
                      class="w-full rounded-md border border-purple-400/30 bg-white/5 py-2 pr-4 pl-10 text-white placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />
                  </div>
                  {checkOtpAction.value?.fieldErrors?.name && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkOtpAction.value.fieldErrors.name}
                    </p>
                  )}
                </div>

                <div class="space-y-2">
                  <label
                    for="name"
                    class="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <div class="relative">
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
                      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                    >
                      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                      <circle
                        cx="16.5"
                        cy="7.5"
                        r=".5"
                        fill="currentColor"
                        style="--darkreader-inline-fill: currentColor;"
                        data-darkreader-inline-fill=""
                      />
                    </svg>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter a password"
                      value={checkOtpAction.formData?.get("password")}
                      class="w-full rounded-md border border-purple-400/30 bg-white/5 py-2 pr-4 pl-10 text-white placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />
                  </div>
                  {checkOtpAction.value?.fieldErrors?.password && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkOtpAction.value.fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading.value}
                  class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
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
                  Sign Up
                </button>
              </Form>
            )}

            {step.value[0] === "password" && (
              <Form
                class="space-y-4"
                action={checkPasswordAction}
                onSubmitCompleted$={(e) => {
                  console.log(e);
                }}
              >
                <div class="space-y-2">
                  <div class="relative">
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
                      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                    >
                      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                      <circle
                        cx="16.5"
                        cy="7.5"
                        r=".5"
                        fill="currentColor"
                        style="--darkreader-inline-fill: currentColor;"
                        data-darkreader-inline-fill=""
                      />
                    </svg>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={checkPasswordAction.formData?.get("password")}
                      placeholder="Enter your password"
                      class="w-full rounded-md border border-purple-400/30 bg-white/5 py-2 pr-4 pl-10 text-white placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />
                  </div>
                  <input type="hidden" name="email" value={step.value[1]} />
                  {checkPasswordAction.value?.fieldErrors?.password && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkPasswordAction.value.fieldErrors.password}
                    </p>
                  )}
                  {checkPasswordAction.value?.fieldErrors?.email && (
                    <p class="mt-2 text-sm text-red-500">
                      {checkPasswordAction.value.fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading.value}
                  class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed"
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
                  Continue
                </button>
              </Form>
            )}
          </section>
        </main>
      </div>
    </div>
  );
});
