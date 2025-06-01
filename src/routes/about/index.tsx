import { component$, useStyles$ } from "@builder.io/qwik";
import Navbar from "~/components/Navbar";
import styles from "../index.css?inline";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  useStyles$(styles);
  return (
    <div class="min-h-screen">
      <Navbar />

      <div class="container mx-auto mt-20 max-w-screen-md">
        <div class="rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-12 backdrop-blur-sm">
          <h2 class="mb-6 text-center text-xl font-bold text-white md:text-3xl">
            About SupportAddress
          </h2>
          <p class="mb-6 text-center text-lg text-white md:text-xl">
            This project was created for the{" "}
            <a href="https://postmarkapp.com/blog/announcing-the-postmark-challenge-inbox-innovators">
              Postmark Inbox Innovators Challenge
            </a>
            . It aims to use Postmark's inbound email processing feature to help
            users create support tickets much easier, without having to create
            an account at any support website, or learn how to use some
            convoluted software.
          </p>
          <p class="mb-6 text-center text-lg text-white md:text-xl">
            This project is open-source under the{" "}
            <a href="https://mit-license.org/" class="text-purple-500">
              MIT License
            </a>
            . It is available on GitHub{" "}
            <a
              href="https://github.com/arnu515/support-address"
              class="text-purple-500"
            >
              here
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "SupportAddress | About",
  meta: [
    {
      name: "description",
      content: "About this project",
    },
  ],
};
