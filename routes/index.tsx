import { define } from "../utils.ts";
import PeopleManager from "../islands/PeopleManager.tsx";

export default define.page(function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div class="px-4 sm:px-6 lg:px-8 py-8 mx-auto min-h-screen flex flex-col">
      <div class="flex-1 flex items-center justify-center">
        <div class="max-w-screen-lg w-full mx-auto flex flex-col items-center justify-center">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gradient text-center">Age Visualizer</h1>

          <PeopleManager currentYear={currentYear} />
        </div>
      </div>

      <footer class="mt-12 pb-6 text-center">
        <div class="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-sm">Made with love •</span>
          <a
            href="https://github.com/ErikMartensson/age-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
});
