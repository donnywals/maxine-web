import fs from "node:fs";
import path from "node:path";

export function getPlanTemplates() {
  const raw = fs.readFileSync(path.join(process.cwd(), "PlanTemplateDefaults.json"), "utf8");
  const data = JSON.parse(raw);
  return data.planSets || [];
}

export function getTemplatePlanInput(templateId) {
  const templates = getPlanTemplates();
  const template = templates.find((item) => item.id === templateId);
  if (!template) return null;

  return {
    title: template.title,
    goal: template.goal,
    description: template.description,
    is_public: false,
    workouts: template.plans.map((plan) => ({
      name: plan.name,
      exercises: plan.exercises.map((exercise) => ({
        exercise_name: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
      })),
    })),
  };
}
