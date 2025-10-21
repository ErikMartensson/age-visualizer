import { computed, Signal, useSignal } from "@preact/signals";
import { useCallback, useEffect, useRef } from "preact/hooks";

interface YearRangeSliderProps {
  minYear: number;
  maxYear: number;
  startYear: Signal<number>;
  endYear: Signal<number>;
  currentYear: number;
  personName?: string;
}

export default function YearRangeSlider(props: YearRangeSliderProps) {
  const {
    minYear,
    maxYear,
    startYear,
    endYear,
    currentYear,
    personName = "Person",
  } = props;

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);
  const frozenMinYear = useSignal<number | null>(null);
  const frozenMaxYear = useSignal<number | null>(null);

  const MIN_VISIBLE_RANGE = 50; // Minimum 50 years visible range

  // Dynamic visible range based on birth year
  const visibleMinYear = computed(() => {
    // Use frozen value while dragging
    if (frozenMinYear.value !== null) {
      return frozenMinYear.value;
    }
    // Show a range that starts 30 years before birth year, but not before minYear
    const dynamicMin = Math.max(minYear, startYear.value - 30);
    return dynamicMin;
  });

  const visibleMaxYear = computed(() => {
    // Use frozen value while dragging
    if (frozenMaxYear.value !== null) {
      return frozenMaxYear.value;
    }
    // Show a range that extends to at least 50 years after birth year or maxYear
    const dynamicMax = Math.min(
      maxYear,
      Math.max(endYear.value + 30, startYear.value + 50),
    );

    // Ensure minimum visible range
    const minRequired = visibleMinYear.value + MIN_VISIBLE_RANGE;
    return Math.max(dynamicMax, minRequired);
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

  const handleMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    let newPosition = ((clientX - sliderRect.left) / sliderRect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));

    if (isDraggingStart.current) {
      const newStartYear = getYearFromPosition(newPosition);

      // Unfreeze if dragging to the edge (left edge for start handle)
      if (newPosition <= 3 && frozenMinYear.value !== null) {
        frozenMinYear.value = null;
        frozenMaxYear.value = null;
      }

      if (newStartYear <= endYear.value) {
        startYear.value = newStartYear;
      } else {
        startYear.value = endYear.value;
      }
    } else if (isDraggingEnd.current) {
      const newEndYear = getYearFromPosition(newPosition);

      // Unfreeze if dragging to the edge (right edge for end handle)
      if (newPosition >= 97 && frozenMaxYear.value !== null) {
        frozenMinYear.value = null;
        frozenMaxYear.value = null;
      }

      if (newEndYear >= startYear.value) {
        endYear.value = newEndYear;
      } else {
        endYear.value = startYear.value;
      }
    }
  }, [minYear, maxYear, startYear, endYear]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    isDraggingStart.current = false;
    isDraggingEnd.current = false;
    // Unfreeze the visible range
    frozenMinYear.value = null;
    frozenMaxYear.value = null;
    globalThis.removeEventListener("mousemove", handleMouseMove);
    globalThis.removeEventListener("mouseup", handleEnd);
    globalThis.removeEventListener("touchmove", handleTouchMove);
    globalThis.removeEventListener("touchend", handleEnd);
  }, [handleMouseMove, handleTouchMove]);

  const handleStart = (
    handleType: "start" | "end",
  ) => {
    // Freeze the visible range at the moment dragging starts
    frozenMinYear.value = visibleMinYear.value;
    frozenMaxYear.value = visibleMaxYear.value;

    if (handleType === "start") {
      isDraggingStart.current = true;
    } else {
      isDraggingEnd.current = true;
    }
    globalThis.addEventListener("mousemove", handleMouseMove);
    globalThis.addEventListener("mouseup", handleEnd);
    globalThis.addEventListener("touchmove", handleTouchMove);
    globalThis.addEventListener("touchend", handleEnd);
  };

  const handleMouseDown = (
    e: MouseEvent,
    handleType: "start" | "end",
  ) => {
    e.preventDefault();
    handleStart(handleType);
  };

  const handleTouchStart = (
    e: TouchEvent,
    handleType: "start" | "end",
  ) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleStart(handleType);
    }
  };

  useEffect(() => {
    // Clean up event listeners when component unmounts
    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleEnd);
      globalThis.removeEventListener("touchmove", handleTouchMove);
      globalThis.removeEventListener("touchend", handleEnd);
    };
  }, [handleMouseMove, handleEnd, handleTouchMove]);

  const startPos = computed(() => getPositionFromYear(startYear.value));
  const endPos = computed(() => getPositionFromYear(endYear.value));

  const ageMessage = computed(() => {
    const age = endYear.value - startYear.value;
    if (endYear.value < currentYear) {
      return `${personName} was ${age} years old in ${endYear.value}`;
    } else if (endYear.value === currentYear) {
      return `${personName} is ${age} years old today`;
    } else {
      return `${personName} will be ${age} years old in ${endYear.value}`;
    }
  });

  const handleReset = () => {
    startYear.value = 2000;
    endYear.value = currentYear;
  };

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
          class={`year-range-slider-handle ${
            startYear.value === currentYear ? "current-year-handle" : ""
          }`}
          style={{ left: `${startPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "start")}
          onTouchStart={(e) => handleTouchStart(e, "start")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="#1e293b"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
        <div
          class={`year-range-slider-handle ${
            endYear.value === currentYear ? "current-year-handle" : ""
          }`}
          style={{ left: `${endPos.value}%` }}
          onMouseDown={(e) => handleMouseDown(e, "end")}
          onTouchStart={(e) => handleTouchStart(e, "end")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="#1e293b"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 text-base sm:text-lg font-semibold text-slate-300">
        <span class="bg-slate-700/50 px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          Birth Year:{" "}
          <span
            class={startYear.value === currentYear
              ? "text-red-400"
              : "text-blue-400"}
          >
            {startYear.value}
          </span>
        </span>
        <span class="bg-slate-700/50 px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
          Target Year:{" "}
          <span
            class={endYear.value === currentYear
              ? "text-red-400"
              : "text-blue-400"}
          >
            {endYear.value}
          </span>
        </span>
      </div>
      <div class="mt-6 flex items-center justify-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7 text-blue-400 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-xl sm:text-2xl text-center font-semibold text-slate-100">
          {ageMessage.value}
        </p>
      </div>
      <div class="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}
