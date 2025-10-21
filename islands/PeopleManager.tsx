import { useSignal } from "@preact/signals";
import YearRangeSlider from "./YearRangeSlider.tsx";

interface PeopleManagerProps {
  currentYear: number;
}

interface Person {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
}

function PersonSlider({
  person,
  showNameInput,
  currentYear,
  onRemove,
  onUpdateName
}: {
  person: Person;
  showNameInput: boolean;
  currentYear: number;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
}) {
  const startYear = useSignal(person.startYear);
  const endYear = useSignal(person.endYear);

  return (
    <div class="slider-card w-full relative">
      {showNameInput && (
        <div class="mb-4 flex gap-2">
          <input
            type="text"
            value={person.name}
            onInput={(e) => onUpdateName((e.target as HTMLInputElement).value)}
            class="flex-1 px-4 py-2 bg-slate-700/50 text-slate-100 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Enter name..."
          />
          <button
            onClick={onRemove}
            class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/50 transition-all flex items-center gap-2"
            title="Remove person"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <YearRangeSlider
        minYear={1900}
        maxYear={2100}
        startYear={startYear}
        endYear={endYear}
        currentYear={currentYear}
        personName={showNameInput ? person.name : "Person"}
      />
    </div>
  );
}

export default function PeopleManager({ currentYear }: PeopleManagerProps) {
  const people = useSignal<Person[]>([
    { id: 1, name: "Person 1", startYear: 2000, endYear: currentYear }
  ]);
  const nextId = useSignal(2);

  const addPerson = () => {
    people.value = [
      ...people.value,
      { id: nextId.value, name: `Person ${nextId.value}`, startYear: 2000, endYear: currentYear }
    ];
    nextId.value++;
  };

  const removePerson = (id: number) => {
    if (people.value.length > 1) {
      people.value = people.value.filter(p => p.id !== id);
    }
  };

  const updatePersonName = (id: number, name: string) => {
    people.value = people.value.map(p =>
      p.id === id ? { ...p, name } : p
    );
  };

  const showNameInputs = people.value.length > 1;

  return (
    <div class="w-full space-y-6">
      {people.value.map((person) => (
        <PersonSlider
          key={person.id}
          person={person}
          showNameInput={showNameInputs}
          currentYear={currentYear}
          onRemove={() => removePerson(person.id)}
          onUpdateName={(name) => updatePersonName(person.id, name)}
        />
      ))}

      <button
        onClick={addPerson}
        class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Person
      </button>
    </div>
  );
}
