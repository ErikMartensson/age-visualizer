import { useSignal, Signal, computed } from "@preact/signals";
import { useEffect, useRef, useCallback } from "preact/hooks";

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

  const getPositionFromYear = (year: number) => {
    const range = maxYear - minYear;
    return ((year - minYear) / range) * 100;
  };

  const getYearFromPosition = (position: number) => {
    const range = maxYear - minYear;
    const year = Math.round((position / 100) * range) + minYear;
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
  for (let year = minYear; year <= maxYear; year++) {
    const position = getPositionFromYear(year);
    const isCurrentYear = year === currentYear;
    const isDecade = year % 10 === 0;

    yearMarkers.push(
      <div
        key={year}
        class={`year-range-slider-marker ${isCurrentYear ? "current-year-marker" : ""} ${isDecade ? "decade-marker" : ""}`}
        style={{ left: `${position}%` }}
      ></div>,
    );
  }

  return (
    <div class="w-full p-4">
      <div class="year-range-slider-track" ref={sliderRef}>
        {yearMarkers}
        <div
          class="year-range-slider-range"
          style={{ left: `${startPos.value}%`, width: `${endPos.value - startPos.value}%` }}
        ></div>
        <div
          class="year-range-slider-handle"
          style={{ left: `${startPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "start")}
        ></div>
        <div
          class="year-range-slider-handle"
          style={{ left: `${endPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "end")}
        ></div>
      </div>
      <div class="flex justify-between mt-4 text-lg font-bold">
        <span>Start: {startYear.value}</span>
        <span>End: {endYear.value}</span>
      </div>
      <p class="mt-4 text-xl text-center">
        {ageMessage.value}
      </p>
    </div>
  );
}
