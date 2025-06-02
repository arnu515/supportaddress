import { component$, useStyles$ } from "@builder.io/qwik";
import { type DocumentHead, Link, RequestHandler } from "@builder.io/qwik-city";
import styles from "./index.css?inline";
import Navbar from "~/components/Navbar";

export const onGet: RequestHandler = async (req) => {
  const user = req.sharedMap.get("user");
  console.log(user);
  if (user) throw req.redirect(302, "/app");
  req.next();
};

const Hero = () => (
  <section class="relative px-4 py-20 md:py-32">
    <div class="container mx-auto text-center">
      <div class="absolute inset-0 mx-4 rounded-3xl bg-white/5 backdrop-blur-sm md:mx-8" />

      <div class="relative z-10 mx-auto max-w-4xl">
        <div class="mb-8 inline-flex items-center rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 backdrop-blur-sm">
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
            class="mr-2 h-4 w-4 text-purple-400"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>
          <span class="text-sm text-purple-200 select-none">
            Email-First Support Platform
          </span>
        </div>

        <h1 class="mb-6 text-4xl leading-tight font-bold text-white md:text-6xl lg:text-7xl">
          Transform Your
          <span class="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {" "}
            Customer Support
          </span>
        </h1>
        <p class="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl">
          Streamline your Support with easy email delivery, AI-powered
          organisation, and analytics that help you deliver exceptional customer
          experiences.
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth"
            class="cursor-pointer rounded-xl border bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-lg font-medium text-white shadow-2xl shadow-purple-500/25 transition-colors duration-300 hover:from-purple-600 hover:to-blue-600"
          >
            Create Account
          </Link>
          <button class="cursor-pointer rounded-xl border border-2 border-purple-400/50 bg-white px-6 py-3 text-lg font-medium text-purple-500 backdrop-blur-sm transition-colors duration-300 hover:bg-purple-400/10">
            Watch Demo
          </button>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" class="container mx-auto px-8 py-20">
    <div class="container mx-auto">
      <div class="mb-16 text-center">
        <h2 class="mb-6 text-3xl font-bold text-white md:text-5xl">
          What makes <strong>us</strong> special?
        </h2>
        <p class="mx-auto max-w-2xl text-xl text-gray-300">
          Built for teams that want a hassle-free support system, both for their
          agents and their users.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2">
        {[
          {
            icon: (
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
                class="h-6 w-6 text-white"
              >
                <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
                <path d="m18 15 4-4" />
                <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
              </svg>
            ),
            title: "Easy to Use",
            description:
              "Users just send emails! Email has been with us since the dawn of the internet. No more travelling through nested complicated UIs to raise a simple support ticket.",
          },
          {
            icon: (
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
                class="h-6 w-6 text-white"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </svg>
            ),
            title: "AI Enhanced",
            description:
              "Use AI to get summaries of help tickets, read from your knowledge base, and enhance your responses.",
          },
          {
            icon: (
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
                class="h-6 w-6 text-white"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            ),
            title: "Teamwork made simple",
            description:
              "We have features that let agents work together, and raise tickets to their managers.",
          },
          {
            icon: (
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
                class="h-6 w-6 text-white"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M8 7v7" />
                <path d="M12 7v4" />
                <path d="M16 7v9" />
              </svg>
            ),
            title: "Organisation",
            description: "Use kanban boards to triage through support tickets.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            class="rouded-xl group flex flex-col gap-6 border border-purple-400/20 bg-white/5 py-6 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
          >
            <div class="p-8">
              <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 class="mb-4 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p class="leading-relaxed text-gray-300">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const GetStarted = () => (
  <section class="container mx-auto px-8 py-20">
    <h2 class="mb-16 text-center text-3xl font-bold text-white md:text-5xl">
      Get Started in Minutes
    </h2>

    <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
      {[
        {
          step: "01",
          title: "Create your Organisation",
          description:
            "Create your organisation and create sub-groups within your organisation. Put your new unique support email on your website.",
        },
        {
          step: "02",
          title: "Configure Your Team",
          description: "Invite team members and set up routing rules.",
        },
        {
          step: "03",
          title: "Start Supporting",
          description:
            "Begin handling customer support emails with AI assistance and powerful tools.",
        },
      ].map((step, index) => (
        <div key={index} class="group text-center">
          <div class="relative mb-8">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-transform group-hover:scale-110">
              <span class="text-2xl font-bold text-white">{step.step}</span>
            </div>
          </div>
          <h3 class="mb-4 text-xl font-semibold text-white">{step.title}</h3>
          <p class="text-gray-300">{step.description}</p>
        </div>
      ))}
    </div>

    <div class="container mx-auto mt-20 max-w-screen-md">
      <div class="mx-auto max-w-4xl rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-12 backdrop-blur-sm">
        <h2 class="mb-6 text-center text-xl font-bold text-white md:text-3xl">
          Ready to Transform Your Support?
        </h2>
        <div class="flex items-center justify-center">
          <Link
            href="/auth"
            class="cursor-pointer rounded-xl border bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-lg font-medium text-white shadow-2xl shadow-purple-500/25 transition-colors duration-300 hover:from-purple-600 hover:to-blue-600"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default component$(() => {
  useStyles$(styles);
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <GetStarted />

      <footer class="mt-20 mb-4 text-center">
        <p class="text-lg text-gray-300">
          &copy; Copyright 2025 Aarnav Pai.{" "}
          <Link href="/about" class="text-purple-500">
            About this project
          </Link>
        </p>
      </footer>
    </>
  );
});

export const head: DocumentHead = {
  title: "SupportAddress | Email-First Support",
  meta: [
    {
      name: "description",
      content:
        "SupportAddress provides an AI-enhanced email-first Support ticketing service so your users can focus on writing support tickets rather than juggling through complicated software.",
    },
  ],
};
