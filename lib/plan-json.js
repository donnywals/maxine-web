const AMOUNT_KEYS = ["sets", "reps", "weight", "duration"];

export function compactPerformedSet(row) {
  if (!row || typeof row !== "object") return {};

  const result = {};
  for (const key of AMOUNT_KEYS) {
    const value = row[key];
    if (value == null || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) result[key] = number;
  }
  return result;
}

export function normalizePerformedSets(exercise) {
  const raw = exercise?.performedSets ?? exercise?.performed_sets;
  let rows = [];

  if (typeof raw === "string" && raw.trim()) {
    try {
      rows = JSON.parse(raw);
    } catch {
      rows = [];
    }
  } else if (Array.isArray(raw)) {
    rows = raw;
  }

  const compacted = rows
    .map(compactPerformedSet)
    .filter((row) => Object.keys(row).length > 0)
    .slice(0, 20);

  if (compacted.length > 0) return compacted;

  const single = compactPerformedSet(exercise);
  return Object.keys(single).length > 0 ? [single] : [];
}

export function formatPerformedSet(row) {
  const compact = compactPerformedSet(row);
  const setsPrefix = compact.sets != null ? `${compact.sets}×` : "";
  let work = "";
  if (compact.reps != null && compact.duration != null) {
    work = `${compact.reps} / ${compact.duration}s`;
  } else if (compact.reps != null) {
    work = String(compact.reps);
  } else if (compact.duration != null) {
    work = `${compact.duration}s`;
  }
  const weight = compact.weight != null ? ` @ ${compact.weight}` : "";
  return `${setsPrefix}${work}${weight}`.trim() || "-";
}

export function formatPerformedSets(rows) {
  if (!rows?.length) return "-";
  return rows.map(formatPerformedSet).join(" · ");
}

function planTemplateExerciseFromDb(exercise) {
  const performedSets = normalizePerformedSets(exercise);
  const first = performedSets[0] || {};
  const result = { exerciseName: exercise.exercise_name };

  if (first.reps != null) result.reps = first.reps;
  if (first.sets != null) result.sets = first.sets;
  if (first.weight != null) result.weight = first.weight;
  if (first.duration != null) result.duration = first.duration;
  if (performedSets.length > 0) result.performedSets = performedSets;

  return result;
}

export function planToPublicJson(plan) {
  return {
    planSets: [
      {
        id: plan.slug || plan.id,
        goal: plan.goal || "",
        title: plan.title,
        description: plan.description || "",
        plans: plan.workouts.map((workout) => ({
          name: workout.name,
          exercises: workout.exercises.map(planTemplateExerciseFromDb),
        })),
      },
    ],
  };
}

export function planInputFromTemplateSet(planSet, { isPublic = false } = {}) {
  return {
    title: planSet.title,
    goal: planSet.goal || "",
    description: planSet.description || "",
    is_public: isPublic,
    workouts: (planSet.plans || []).map((workout) => {
      const exercises = (workout.exercises || []).map((exercise) => {
        const performedSets = normalizePerformedSets({
          ...exercise,
          exerciseName: exercise.exerciseName,
        });
        const first = performedSets[0] || {};
        return {
          exercise_name: exercise.exerciseName,
          sets: first.sets,
          reps: first.reps,
          weight: first.weight,
          duration: first.duration,
          performedSets,
        };
      });

      return {
        name: workout.name,
        exercises,
      };
    }),
  };
}

export function planShareUrls(slug, origin) {
  const base = String(origin || "https://maxine-app.com").replace(/\/$/, "");
  return {
    shareUrl: `${base}/plans/${slug}`,
    jsonUrl: `${base}/plans/${slug}/json`,
  };
}
