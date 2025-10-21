import { define } from "../utils.ts";
import PeopleManager from "../islands/PeopleManager.tsx";

export default define.page(function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div class="px-4 sm:px-6 lg:px-8 py-8 mx-auto min-h-screen flex items-center justify-center">
      <div class="max-w-screen-lg w-full mx-auto flex flex-col items-center justify-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gradient text-center">Age Visualizer</h1>

        <PeopleManager currentYear={currentYear} />
      </div>
    </div>
  );
});
