export const EXERCISE_EQUIPMENT = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "cable",
  "machine",
  "band",
  "bodyweight",
  "other",
];

export function parseExerciseEquipment(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  if (!EXERCISE_EQUIPMENT.includes(normalized)) {
    throw new Error("Invalid equipment");
  }
  return normalized;
}

export function equipmentLabel(value) {
  if (!value) return "None";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function equipmentForJson(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  return normalized;
}
