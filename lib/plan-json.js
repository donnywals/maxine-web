export function planToPublicJson(plan) {
  return {
    schemaVersion: 1,
    slug: plan.slug,
    title: plan.title,
    goal: plan.goal,
    description: plan.description,
    sourceUrl: `/plans/${plan.slug}`,
    jsonUrl: `/plans/${plan.slug}/json`,
    workouts: plan.workouts.map((workout) => ({
      name: workout.name,
      exercises: workout.exercises.map((exercise) => ({
        name: exercise.exercise_name,
        measurement: exercise.measurement,
        type: exercise.type,
        note: exercise.note,
        video: exercise.video,
        prescription: {
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          duration: exercise.duration,
        },
      })),
    })),
  };
}
