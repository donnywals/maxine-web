function planTemplateExerciseFromDb(exercise) {
  const result = { exerciseName: exercise.exercise_name };
  if (exercise.reps != null) result.reps = exercise.reps;
  if (exercise.sets != null) result.sets = exercise.sets;
  if (exercise.weight != null) result.weight = exercise.weight;
  if (exercise.duration != null) result.duration = exercise.duration;
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
