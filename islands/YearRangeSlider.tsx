import { computed, Signal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";

interface YearRangeSliderProps {
  minYear: number;
  maxYear: number;
  startYear: Signal<number>;
  endYear: Signal<number>;
  currentYear: number;
}

export default function YearRangeSlider(props: YearRangeSliderProps) {
  const { minYear, maxYear, startYear, endYear, currentYear } = props;

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);

  // Dynamic visible range based on birth year
  const visibleMinYear = computed(() => {
    // Show a range that starts 20 years before birth year, but not before minYear
    const dynamicMin = Math.max(minYear, startYear.value - 20);
    return dynamicMin;
  });

  const visibleMaxYear = computed(() => {
    // Show a range that extends to at least 120 years after birth year or maxYear
    const dynamicMax = Math.min(maxYear, Math.max(endYear.value + 20, startYear.value + 120));
    return dynamicMax;
  });

  const getPositionFromYear = (year: number) => {
    const range = visibleMaxYear.value - visibleMinYear.value;
    return ((year - visibleMinYear.value) / range) * 100;
  };

  const getYearFromPosition = (position: number) => {
    const range = visibleMaxYear.value - visibleMinYear.value;
    const year = Math.round((position / 100) * range) + visibleMinYear.value;
    return Math.max(minYear, Math.min(maxYear, year));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    let newPosition = ((e.clientX - sliderRect.left) / sliderRect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));

    if (isDraggingStart.current) {
      const newStartYear = getYearFromPosition(newPosition);
      if (newStartYear <= endYear.value) {
        startYear.value = newStartYear;
      } else {
        startYear.value = endYear.value;
      }
    } else if (isDraggingEnd.current) {
      const newEndYear = getYearFromPosition(newPosition);
      if (newEndYear >= startYear.value) {
        endYear.value = newEndYear;
      } else {
        endYear.value = startYear.value;
      }
    }
  }, [minYear, maxYear, startYear, endYear]); // Dependencies for useCallback

  const handleMouseUp = useCallback(() => {
    isDraggingStart.current = false;
    isDraggingEnd.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]); // Dependency for useCallback

  const handleMouseDown = useCallback((
    e: MouseEvent,
    handleType: "start" | "end",
  ) => {
    e.preventDefault();
    if (handleType === "start") {
      isDraggingStart.current = true;
    } else {
      isDraggingEnd.current = true;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, handleMouseUp]); // Dependencies for useCallback

  useEffect(() => {
    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startPos = computed(() => getPositionFromYear(startYear.value));
  const endPos = computed(() => getPositionFromYear(endYear.value));

  const ageMessage = computed(() => {
    const age = endYear.value - startYear.value;
    if (endYear.value < currentYear) {
      return `Person was ${age} years old in ${endYear.value}`;
    } else if (endYear.value === currentYear) {
      return `Person is ${age} years old today`;
    } else {
      return `Person will be ${age} years old in ${endYear.value}`;
    }
  });

  const yearMarkers = [];
  for (let year = visibleMinYear.value; year <= visibleMaxYear.value; year++) {
    const position = getPositionFromYear(year);
    const isCurrentYear = year === currentYear;
    const isDecade = year % 10 === 0;

    yearMarkers.push(
      <div
        key={year}
        class={`year-range-slider-marker ${
          isCurrentYear ? "current-year-marker" : ""
        } ${isDecade ? "decade-marker" : ""}`}
        style={{ left: `${position}%` }}
      >
      </div>,
    );
  }

  return (
    <div class="w-full">
      <div class="year-range-slider-track" ref={sliderRef}>
        {yearMarkers}
        <div
          class="year-range-slider-range"
          style={{
            left: `${startPos.value}%`,
            width: `${endPos.value - startPos.value}%`,
          }}
        >
        </div>
        <div
          class={`year-range-slider-handle ${startYear.value === currentYear ? "current-year-handle" : ""}`}
          style={{ left: `${startPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "start")}
        >
        </div>
        <div
          class={`year-range-slider-handle ${endYear.value === currentYear ? "current-year-handle" : ""}`}
          style={{ left: `${endPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "end")}
        >
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 text-base sm:text-lg font-semibold text-slate-300">
        <span class="bg-slate-700/50 px-4 py-2 rounded-lg text-center">Birth Year: <span class={startYear.value === currentYear ? "text-red-400" : "text-blue-400"}>{startYear.value}</span></span>
        <span class="bg-slate-700/50 px-4 py-2 rounded-lg text-center">Target Year: <span class={endYear.value === currentYear ? "text-red-400" : "text-blue-400"}>{endYear.value}</span></span>
      </div>
      <p class="mt-6 text-xl sm:text-2xl text-center font-semibold text-slate-100">
        {ageMessage.value}
      </p>
    </div>
  );
}
