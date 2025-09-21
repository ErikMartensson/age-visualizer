import { useSignal } from "@preact/signals";
import { define } from "../utils.ts";
import YearRangeSlider from "../islands/YearRangeSlider.tsx";

export default define.page(function Home() {
  const startYear = useSignal(1990);
  const endYear = useSignal(2005);
  const currentYear = new Date().getFullYear();

  return (
    <div class="px-4 py-8 mx-auto fresh-gradient">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold mb-8">Age Visualizer</h1>
        <YearRangeSlider
          minYear={1900}
          maxYear={2050}
          startYear={startYear}
          endYear={endYear}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
});
