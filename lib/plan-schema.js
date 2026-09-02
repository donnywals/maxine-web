import { z } from "zod";
import { normalizePerformedSets, planInputFromTemplateSet } from "./plan-json";

const MAX_WORKOUTS = 20;
const MAX_EXERCISES_PER_WORKOUT = 50;
const MAX_PERFORMED_SETS = 20;

const optionalAmount = z.number().finite().nonnegative().nullish();

const performedSetSchema = z.object({
  sets: optionalAmount,
  reps: optionalAmount,
  weight: optionalAmount,
  duration: optionalAmount,
});

const exerciseSchema = z
  .object({
    exerciseName: z.string().trim().min(1).max(200).optional(),
    exercise_name: z.string().trim().min(1).max(200).optional(),
    sets: optionalAmount,
    reps: optionalAmount,
    weight: optionalAmount,
    duration: optionalAmount,
    performedSets: z.array(performedSetSchema).max(MAX_PERFORMED_SETS).nullish(),
  })
  .transform((exercise) => {
    const performedSets = normalizePerformedSets(exercise);
    const first = performedSets[0] || {};
    return {
      exerciseName: exercise.exerciseName || exercise.exercise_name || "",
      sets: first.sets,
      reps: first.reps,
      weight: first.weight,
      duration: first.duration,
      performedSets,
    };
  })
  .pipe(
    z.object({
      exerciseName: z.string().trim().min(1).max(200),
      sets: optionalAmount,
      reps: optionalAmount,
      weight: optionalAmount,
      duration: optionalAmount,
      performedSets: z.array(performedSetSchema).max(MAX_PERFORMED_SETS),
    }),
  );

const workoutSchema = z.object({
  name: z.string().trim().min(1).max(200),
  exercises: z.array(exerciseSchema).min(1).max(MAX_EXERCISES_PER_WORKOUT),
});

export const planSetSchema = z.object({
  id: z.string().trim().max(200).nullish(),
  title: z.string().trim().min(1).max(200),
  goal: z.string().trim().max(200).nullish().default(""),
  description: z.string().trim().max(5000).nullish().default(""),
  plans: z.array(workoutSchema).min(1).max(MAX_WORKOUTS),
});

export const sharePlanBodySchema = z.object({
  planSets: z.array(planSetSchema).length(1),
});

export function parseSharePlanBody(body) {
  const parsed =
    body && typeof body === "object" && Array.isArray(body.planSets)
      ? sharePlanBodySchema.parse(body).planSets[0]
      : planSetSchema.parse(body);

  return planInputFromTemplateSet(parsed, { isPublic: true });
}

export function formatPlanValidationError(error) {
  const details = (error?.issues || []).map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return {
    error: "Invalid workout plan",
    details,
  };
}
