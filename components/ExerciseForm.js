"use client";

import { useState } from "react";
import { saveExerciseAction } from "../app/admin/actions";

const MEASUREMENTS = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "weighted", label: "Weighted" },
  { value: "timed", label: "Timed" },
  { value: "timedAndWeight", label: "Timed and weighted" },
];

export function ExerciseForm({ exercise }) {
  const [measurement, setMeasurement] = useState(exercise?.measurement || "bodyweight");
  const visibleFields = prescriptionFieldsFor(measurement);

  return (
    <form action={saveExerciseAction} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <input name="id" type="hidden" value={exercise?.id || ""} />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" name="name" required value={exercise?.name} />
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="measurement">
            Measurement
          </label>
          <select
            className="mt-2 block w-full rounded-xl border-gray-300"
            id="measurement"
            name="measurement"
            onChange={(event) => setMeasurement(event.target.value)}
            required
            value={measurement}
          >
            {MEASUREMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Type" name="type" value={exercise?.type} />
        <Field label="Video" name="video" value={exercise?.video} />
        <PrescriptionField
          label="Sets"
          name="sets"
          value={exercise?.sets}
          visible={visibleFields.has("sets")}
        />
        <PrescriptionField
          label="Reps"
          name="reps"
          value={exercise?.reps}
          visible={visibleFields.has("reps")}
        />
        <PrescriptionField
          label="Weight"
          name="weight"
          value={exercise?.weight}
          visible={visibleFields.has("weight")}
        />
        <PrescriptionField
          label="Duration (sec)"
          name="duration"
          value={exercise?.duration}
          visible={visibleFields.has("duration")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="note">
          Note
        </label>
        <textarea
          className="mt-2 block w-full rounded-xl border-gray-300"
          defaultValue={exercise?.note || ""}
          id="note"
          name="note"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="aliases">
          Aliases
        </label>
        <textarea
          className="mt-2 block w-full rounded-xl border-gray-300"
          defaultValue={(exercise?.aliases || []).join("\n")}
          id="aliases"
          name="aliases"
          rows={4}
        />
        <p className="mt-2 text-sm text-gray-500">One alias per line, or comma-separated.</p>
      </div>
      <button className="rounded-full bg-[#491964] px-5 py-3 font-semibold text-white hover:bg-[#37124F]">
        Save exercise
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", value, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        className="mt-2 block w-full rounded-xl border-gray-300"
        defaultValue={value ?? ""}
        id={name}
        name={name}
        required={required}
        step="any"
        type={type}
      />
    </div>
  );
}

function prescriptionFieldsFor(measurement) {
  if (measurement === "timed") return new Set(["sets", "duration"]);
  if (measurement === "timedAndWeight") return new Set(["sets", "duration", "weight"]);
  if (measurement === "weighted") return new Set(["sets", "reps", "weight"]);
  return new Set(["sets", "reps"]);
}

function PrescriptionField({ label, name, value, visible }) {
  if (!visible) {
    return <input name={name} type="hidden" value="" />;
  }

  return <Field label={label} name={name} type="number" value={value} />;
}
