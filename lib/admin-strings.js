export const TOAST_QUERY_PARAM = "toast";

export const ADMIN_STRINGS = {
  filterAll: "All",
  filterByType: "Filter by type",
  filterByEquipment: "Filter by equipment",
  exerciseSearchLabel: "Search titles and aliases",
  exerciseSearchPlaceholder: "Try dumbbell curls, chin up, squat...",
  showingExercises: (shown, total) => `Showing ${shown} of ${total} exercises`,
  noMatchingExercises: "No matching exercises",
  noMatchingExercisesHint:
    "Try a different title, alias, type, or equipment selection.",
  noMetadata: "No metadata",
  matchedAlias: (alias) => `Matched alias: ${alias}`,
  aliasCount: (count) => `${count} aliases`,
};

export const ADMIN_TOAST_MESSAGES = {
  exercise_saved: "Exercise saved.",
  exercise_deleted: "Exercise deleted.",
  plan_saved: "Plan saved.",
  plan_created: "Plan created.",
  plan_deleted: "Plan deleted.",
  user_saved: "User saved.",
  user_created: "User created.",
};
