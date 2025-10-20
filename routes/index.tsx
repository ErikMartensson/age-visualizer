import { useSignal } from "@preact/signals";
import { define } from "../utils.ts";
import YearRangeSlider from "../islands/YearRangeSlider.tsx";

export default define.page(function Home() {
  const startYear = useSignal(2000);
  const currentYear = new Date().getFullYear();
  const endYear = useSignal(currentYear);

  return (
    <div class="px-4 sm:px-6 lg:px-8 py-8 mx-auto min-h-screen flex items-center justify-center">
      <div class="max-w-screen-md w-full mx-auto flex flex-col items-center justify-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gradient text-center">Age Visualizer</h1>
        <div class="slider-card w-full">
          <YearRangeSlider
            minYear={1900}
            maxYear={2100}
            startYear={startYear}
            endYear={endYear}
            currentYear={currentYear}
          />
        </div>
      </div>
    </div>
  );
});
