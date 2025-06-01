import { Link } from "@builder.io/qwik-city";

export default () => (
  <nav class="relative px-4 py-6">
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <img src="/favicon.svg" alt="Logo" class="h-8 w-8" />
        <Link href="/" class="text-xl font-bold text-white">
          SupportAddress
        </Link>
      </div>
      <div class="hidden items-center space-x-8 md:flex">
        <a
          href="/#features"
          class="text-gray-300 transition-colors hover:text-white"
        >
          Features
        </a>
        <Link
          href="/pricing"
          class="text-gray-300 transition-colors hover:text-white"
        >
          Pricing
        </Link>
        <Link
          href="/contact"
          class="text-gray-300 transition-colors hover:text-white"
        >
          Contact
        </Link>
        <button class="cursor-pointer rounded-lg border border-purple-400 bg-white px-4 py-2 text-purple-500 transition-colors duration-300 hover:bg-purple-400 hover:text-white">
          Sign In
        </button>
      </div>
    </div>
  </nav>
);
