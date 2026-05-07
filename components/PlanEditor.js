"use client";

import { useMemo, useState } from "react";

function emptyExercise() {
  return {
    exercise_id: "",
    exercise_name: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
  };
}

function emptyWorkout() {
  return {
    name: "",
    exercises: [emptyExercise()],
  };
}

export function PlanEditor({ action, plan, exercises }) {
  const [workouts, setWorkouts] = useState(
    plan?.workouts?.length
      ? plan.workouts.map((workout) => ({
          name: workout.name,
          exercises: workout.exercises.length
            ? workout.exercises.map((exercise) => ({
                exercise_id: exercise.exercise_id || "",
                exercise_name: exercise.exercise_name,
                sets: exercise.sets ?? "",
                reps: exercise.reps ?? "",
                weight: exercise.weight ?? "",
                duration: exercise.duration ?? "",
              }))
            : [emptyExercise()],
        }))
      : [emptyWorkout()],
  );
  const exerciseById = useMemo(
    () => Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  function updateWorkout(index, patch) {
    setWorkouts((current) =>
      current.map((workout, workoutIndex) =>
        workoutIndex === index ? { ...workout, ...patch } : workout,
      ),
    );
  }

  function updateExercise(workoutIndex, exerciseIndex, patch) {
    setWorkouts((current) =>
      current.map((workout, currentWorkoutIndex) => {
        if (currentWorkoutIndex !== workoutIndex) return workout;
        return {
          ...workout,
          exercises: workout.exercises.map((exercise, currentExerciseIndex) =>
            currentExerciseIndex === exerciseIndex
              ? { ...exercise, ...patch }
              : exercise,
          ),
        };
      }),
    );
  }

  return (
    <form action={action} className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="title">
              Title
            </label>
            <input
              className="mt-2 block w-full rounded-xl border-gray-300"
              defaultValue={plan?.title || ""}
              id="title"
              name="title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="goal">
              Goal
            </label>
            <input
              className="mt-2 block w-full rounded-xl border-gray-300"
              defaultValue={plan?.goal || ""}
              id="goal"
              name="goal"
            />
          </div>
        </div>
        <label className="mt-5 block text-sm font-medium text-gray-700" htmlFor="description">
          Description
        </label>
        <textarea
          className="mt-2 block w-full rounded-xl border-gray-300"
          defaultValue={plan?.description || ""}
          id="description"
          name="description"
          rows={4}
        />
        <label className="mt-5 flex items-center gap-3 text-sm font-medium text-gray-700">
          <input
            className="rounded border-gray-300 text-[#491964]"
            defaultChecked={Boolean(plan?.is_public)}
            name="is_public"
            type="checkbox"
          />
          Public plan
        </label>
      </section>

      {workouts.map((workout, workoutIndex) => (
        <section
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          key={workoutIndex}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Workout name
              </label>
              <input
                className="mt-2 block w-full rounded-xl border-gray-300"
                name="workout_name"
                onChange={(event) => updateWorkout(workoutIndex, { name: event.target.value })}
                required
                value={workout.name}
              />
            </div>
            <button
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() =>
                setWorkouts((current) => current.filter((_, index) => index !== workoutIndex))
              }
              type="button"
            >
              Remove workout
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {workout.exercises.map((exercise, exerciseIndex) => {
              const selectedExercise = exerciseById[exercise.exercise_id];
              const visibleFields = prescriptionFieldsFor(
                selectedExercise?.measurement,
              );

              return (
                <div
                  className="rounded-2xl border border-gray-200 p-4"
                  key={`${workoutIndex}-${exerciseIndex}`}
                >
                  <input name="workout_index" type="hidden" value={workoutIndex} />
                  <div className="grid gap-4 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Exercise
                      </label>
                      <select
                        className="mt-1 block w-full rounded-xl border-gray-300"
                        name="exercise_id"
                        onChange={(event) => {
                          const selected = exerciseById[event.target.value];
                          updateExercise(workoutIndex, exerciseIndex, {
                            exercise_id: event.target.value,
                            exercise_name: selected?.name || exercise.exercise_name,
                          });
                        }}
                        value={exercise.exercise_id}
                        required
                      >
                        <option value="">Pick an exercise</option>
                        {exercises.map((catalogExercise) => (
                          <option key={catalogExercise.id} value={catalogExercise.id}>
                            {catalogExercise.name}
                          </option>
                        ))}
                      </select>
                      <input
                        name="exercise_name"
                        type="hidden"
                        value={selectedExercise?.name || exercise.exercise_name}
                      />
                    </div>
                    <PrescriptionField
                      exercise={exercise}
                      label="Sets"
                      name="sets"
                      onChange={(value) =>
                        updateExercise(workoutIndex, exerciseIndex, { sets: value })
                      }
                      visible={visibleFields.has("sets")}
                    />
                    <PrescriptionField
                      exercise={exercise}
                      label="Reps"
                      name="reps"
                      onChange={(value) =>
                        updateExercise(workoutIndex, exerciseIndex, { reps: value })
                      }
                      visible={visibleFields.has("reps")}
                    />
                    <PrescriptionField
                      exercise={exercise}
                      label="Weight"
                      name="weight"
                      onChange={(value) =>
                        updateExercise(workoutIndex, exerciseIndex, { weight: value })
                      }
                      visible={visibleFields.has("weight")}
                    />
                    <PrescriptionField
                      exercise={exercise}
                      label="Duration (sec)"
                      name="duration"
                      onChange={(value) =>
                        updateExercise(workoutIndex, exerciseIndex, {
                          duration: value,
                        })
                      }
                      visible={visibleFields.has("duration")}
                    />
                  </div>
                  <button
                    className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900"
                    onClick={() =>
                      setWorkouts((current) =>
                        current.map((currentWorkout, index) =>
                          index === workoutIndex
                            ? {
                                ...currentWorkout,
                                exercises: currentWorkout.exercises.filter(
                                  (_, currentExerciseIndex) =>
                                    currentExerciseIndex !== exerciseIndex,
                                ),
                              }
                            : currentWorkout,
                        ),
                      )
                    }
                    type="button"
                  >
                    Remove exercise
                  </button>
                </div>
              );
            })}
          </div>
          <button
            className="mt-5 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() =>
              setWorkouts((current) =>
                current.map((currentWorkout, index) =>
                  index === workoutIndex
                    ? {
                        ...currentWorkout,
                        exercises: [...currentWorkout.exercises, emptyExercise()],
                      }
                    : currentWorkout,
                ),
              )
            }
            type="button"
          >
            Add exercise
          </button>
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-white"
          onClick={() => setWorkouts((current) => [...current, emptyWorkout()])}
          type="button"
        >
          Add workout
        </button>
        <button className="rounded-full bg-[#491964] px-5 py-3 font-semibold text-white hover:bg-[#37124F]">
          Save plan
        </button>
      </div>
    </form>
  );
}

function prescriptionFieldsFor(measurement) {
  if (measurement === "timed") return new Set(["sets", "duration"]);
  if (measurement === "timedAndWeight") {
    return new Set(["sets", "duration", "weight"]);
  }
  if (measurement === "weighted") return new Set(["sets", "reps", "weight"]);
  if (measurement === "bodyweight") return new Set(["sets", "reps"]);
  return new Set(["sets", "reps", "weight", "duration"]);
}

function PrescriptionField({ exercise, label, name, visible, onChange }) {
  if (!visible) {
    return <input name={name} type="hidden" value="" />;
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        className="mt-1 block w-full rounded-xl border-gray-300"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        step="any"
        type="number"
        value={exercise[name]}
      />
    </div>
  );
}
