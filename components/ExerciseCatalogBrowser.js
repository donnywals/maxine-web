"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_STRINGS } from "../lib/admin-strings";
import {
  EQUIPMENT_FILTER_NONE,
  EQUIPMENT_FILTER_OPTIONS,
  equipmentLabel,
  exerciseEquipmentFilterKey,
} from "../lib/exercise-equipment";

export function ExerciseCatalogBrowser({ exercises }) {
  const types = useMemo(
    () =>
      Array.from(new Set(exercises.map((exercise) => exercise.type).filter(Boolean))).sort(
        (first, second) => first.localeCompare(second),
      ),
    [exercises],
  );
  const equipmentOptions = EQUIPMENT_FILTER_OPTIONS;
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(() => types);
  const [selectedEquipment, setSelectedEquipment] = useState(() => equipmentOptions);

  const allTypesSelected =
    selectedTypes.length === types.length &&
    types.every((type) => selectedTypes.includes(type));
  const allEquipmentSelected =
    selectedEquipment.length === equipmentOptions.length &&
    equipmentOptions.every((option) => selectedEquipment.includes(option));
  const selectedTypeSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);
  const selectedEquipmentSet = useMemo(() => new Set(selectedEquipment), [selectedEquipment]);
  const results = useMemo(
    () =>
      filterExercises(
        exercises,
        query,
        selectedTypeSet,
        allTypesSelected,
        selectedEquipmentSet,
        allEquipmentSelected,
      ),
    [
      allEquipmentSelected,
      allTypesSelected,
      exercises,
      query,
      selectedEquipmentSet,
      selectedTypeSet,
    ],
  );

  function toggleType(type) {
    setSelectedTypes((current) => {
      const currentHasEveryType =
        current.length === types.length && types.every((currentType) => current.includes(currentType));
      if (currentHasEveryType) return [type];

      return current.includes(type)
        ? current.filter((selectedType) => selectedType !== type)
        : [...current, type].sort((first, second) => first.localeCompare(second));
    });
  }

  function toggleEquipment(option) {
    setSelectedEquipment((current) => {
      const currentHasEveryOption =
        current.length === equipmentOptions.length &&
        equipmentOptions.every((equipmentOption) => current.includes(equipmentOption));
      if (currentHasEveryOption) return [option];

      return current.includes(option)
        ? current.filter((selectedOption) => selectedOption !== option)
        : sortEquipmentSelection([...current, option]);
    });
  }

  function equipmentChipLabel(option) {
    if (option === EQUIPMENT_FILTER_NONE) return equipmentLabel(null);
    return equipmentLabel(option);
  }

  return (
    <div className="mt-8 space-y-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <label className="block text-sm font-medium text-gray-700" htmlFor="exercise-search">
          {ADMIN_STRINGS.exerciseSearchLabel}
        </label>
        <input
          className="mt-2 block w-full rounded-xl border-gray-300"
          id="exercise-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={ADMIN_STRINGS.exerciseSearchPlaceholder}
          type="search"
          value={query}
        />

        <div className="mt-5" role="group" aria-labelledby="exercise-filter-type-label">
          <p className="text-sm font-medium text-gray-700" id="exercise-filter-type-label">
            {ADMIN_STRINGS.filterByType}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              aria-label={ADMIN_STRINGS.filterAllTypes}
              aria-pressed={allTypesSelected}
              className={filterButtonClassName(allTypesSelected)}
              onClick={() => setSelectedTypes(types)}
              type="button"
            >
              {ADMIN_STRINGS.filterAll}
            </button>
            {types.map((type) => {
              const isSelected = selectedTypeSet.has(type);
              return (
                <button
                  aria-pressed={isSelected}
                  className={filterButtonClassName(isSelected)}
                  key={type}
                  onClick={() => toggleType(type)}
                  type="button"
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5" role="group" aria-labelledby="exercise-filter-equipment-label">
          <p className="text-sm font-medium text-gray-700" id="exercise-filter-equipment-label">
            {ADMIN_STRINGS.filterByEquipment}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              aria-label={ADMIN_STRINGS.filterAllEquipment}
              aria-pressed={allEquipmentSelected}
              className={filterButtonClassName(allEquipmentSelected)}
              onClick={() => setSelectedEquipment(equipmentOptions)}
              type="button"
            >
              {ADMIN_STRINGS.filterAll}
            </button>
            {equipmentOptions.map((option) => {
              const isSelected = selectedEquipmentSet.has(option);
              return (
                <button
                  aria-pressed={isSelected}
                  className={filterButtonClassName(isSelected)}
                  key={option}
                  onClick={() => toggleEquipment(option)}
                  type="button"
                >
                  {equipmentChipLabel(option)}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          {ADMIN_STRINGS.showingExercises(results.length, exercises.length)}
        </p>
      </section>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        {results.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {results.map(({ exercise, matchedAlias }) => (
              <Link
                className="block p-5 hover:bg-gray-50"
                href={`/admin/exercises/${exercise.id}`}
                key={exercise.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-950">{exercise.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {[exercise.measurement, exercise.type, equipmentLabel(exercise.equipment)]
                        .filter(Boolean)
                        .join(" · ") || ADMIN_STRINGS.noMetadata}
                    </p>
                    {matchedAlias ? (
                      <p className="mt-1 text-sm text-gray-500">
                        {ADMIN_STRINGS.matchedAlias(matchedAlias)}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm text-gray-500">
                    {ADMIN_STRINGS.aliasCount(exercise.aliases.length)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <h2 className="text-base font-semibold text-gray-950">
              {ADMIN_STRINGS.noMatchingExercises}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{ADMIN_STRINGS.noMatchingExercisesHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function sortEquipmentSelection(selection) {
  return [...selection].sort((first, second) => {
    if (first === EQUIPMENT_FILTER_NONE) return -1;
    if (second === EQUIPMENT_FILTER_NONE) return 1;
    return first.localeCompare(second);
  });
}

function filterButtonClassName(isSelected) {
  const base =
    "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#491964] focus-visible:ring-offset-2";
  if (isSelected) return `${base} bg-[#491964] text-white hover:bg-[#37124F]`;
  return `${base} border border-gray-300 text-gray-700 hover:bg-gray-50`;
}

function filterExercises(
  exercises,
  query,
  selectedTypeSet,
  allTypesSelected,
  selectedEquipmentSet,
  allEquipmentSelected,
) {
  const tokens = tokenize(query);

  return exercises
    .map((exercise, index) => {
      if (!allTypesSelected && !selectedTypeSet.has(exercise.type)) return null;

      const equipmentKey = exerciseEquipmentFilterKey(exercise.equipment);
      if (!allEquipmentSelected && !selectedEquipmentSet.has(equipmentKey)) return null;

      const match = scoreExercise(exercise, tokens);
      if (!match) return null;

      return { exercise, index, ...match };
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (tokens.length === 0) return first.index - second.index;
      return (
        second.score - first.score ||
        first.exercise.name.localeCompare(second.exercise.name, undefined, {
          sensitivity: "base",
        })
      );
    });
}

function scoreExercise(exercise, tokens) {
  if (tokens.length === 0) return { score: 0, matchedAlias: null };

  const fields = [
    { value: exercise.name, weight: 12, alias: null },
    ...(exercise.aliases || []).map((alias) => ({ value: alias, weight: 8, alias })),
  ];

  let totalScore = 0;
  let matchedAlias = null;

  for (const token of tokens) {
    let bestMatch = null;

    for (const field of fields) {
      const score = scoreToken(normalizeSearchText(field.value), token);
      if (score <= 0) continue;

      const weightedMatch = {
        score: score + field.weight,
        alias: field.alias,
      };

      if (!bestMatch || weightedMatch.score > bestMatch.score) {
        bestMatch = weightedMatch;
      }
    }

    if (!bestMatch) return null;

    totalScore += bestMatch.score;
    if (!matchedAlias && bestMatch.alias) {
      matchedAlias = bestMatch.alias;
    }
  }

  return { score: totalScore, matchedAlias };
}

function scoreToken(value, token) {
  if (!value || !token) return 0;
  if (value === token) return 120;
  if (value.startsWith(token)) return 105;

  const words = value.split(" ");
  if (words.some((word) => word === token)) return 100;
  if (words.some((word) => word.startsWith(token))) return 90;

  const substringIndex = value.indexOf(token);
  if (substringIndex >= 0) return 80 - Math.min(substringIndex, 30);

  const typoScore = bestTypoScore(words, token);
  if (typoScore > 0) return typoScore;

  return orderedCharacterScore(value, token);
}

function bestTypoScore(words, token) {
  let bestScore = 0;
  const maxDistance = token.length < 5 ? 1 : 2;

  for (const word of words) {
    if (Math.abs(word.length - token.length) > maxDistance) continue;

    const distance = levenshteinDistance(word, token);
    if (distance <= maxDistance) {
      bestScore = Math.max(bestScore, 70 - distance * 12);
    }
  }

  return bestScore;
}

function orderedCharacterScore(value, token) {
  let valueIndex = 0;
  let gaps = 0;

  for (const character of token) {
    const matchIndex = value.indexOf(character, valueIndex);
    if (matchIndex === -1) return 0;

    gaps += matchIndex - valueIndex;
    valueIndex = matchIndex + 1;
  }

  return Math.max(20, 55 - gaps);
}

function levenshteinDistance(first, second) {
  const previousRow = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let firstIndex = 0; firstIndex < first.length; firstIndex += 1) {
    let previousDiagonal = previousRow[0];
    previousRow[0] = firstIndex + 1;

    for (let secondIndex = 0; secondIndex < second.length; secondIndex += 1) {
      const previousAbove = previousRow[secondIndex + 1];
      const cost = first[firstIndex] === second[secondIndex] ? 0 : 1;
      previousRow[secondIndex + 1] = Math.min(
        previousRow[secondIndex + 1] + 1,
        previousRow[secondIndex] + 1,
        previousDiagonal + cost,
      );
      previousDiagonal = previousAbove;
    }
  }

  return previousRow[second.length];
}

function tokenize(value) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
