import fs from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { equipmentForJson, parseExerciseEquipment } from "./exercise-equipment.js";
import { normalizePerformedSets } from "./plan-json";

const DB_DIR = process.env.SQLITE_DIR || path.join(process.cwd(), ".data");
const DB_PATH = process.env.SQLITE_PATH || path.join(DB_DIR, "maxine.sqlite");
export const USER_ROLES = ["owner", "user", "trainer"];
export const APP_SHARE_USERNAME = "maxine-share";

let instance;

export function db() {
  if (instance) return instance;

  fs.mkdirSync(DB_DIR, { recursive: true });
  instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");
  migrate(instance);
  seed(instance);
  return instance;
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'user', 'trainer')) DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      measurement TEXT,
      type TEXT,
      note TEXT,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      duration INTEGER,
      video TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exercise_aliases (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      UNIQUE(exercise_id, alias)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      goal TEXT,
      description TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan_workouts (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan_workout_exercises (
      id TEXT PRIMARY KEY,
      workout_id TEXT NOT NULL REFERENCES plan_workouts(id) ON DELETE CASCADE,
      exercise_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
      exercise_name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      duration INTEGER,
      performed_sets TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
    CREATE INDEX IF NOT EXISTS idx_plan_workouts_plan_id ON plan_workouts(plan_id);
    CREATE INDEX IF NOT EXISTS idx_plan_workout_exercises_workout_id ON plan_workout_exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_exercise_aliases_exercise_id ON exercise_aliases(exercise_id);
  `);
  ensureUserRoleConstraint(database);
  ensurePlanSlugs(database);
  ensureExerciseEquipmentColumn(database);
  ensurePerformedSetsColumn(database);
}

function ensureExerciseEquipmentColumn(database) {
  const hasColumn = database
    .prepare("PRAGMA table_info(exercises)")
    .all()
    .some((column) => column.name === "equipment");

  if (!hasColumn) {
    database.exec("ALTER TABLE exercises ADD COLUMN equipment TEXT");
  }
}

function ensurePerformedSetsColumn(database) {
  const hasColumn = database
    .prepare("PRAGMA table_info(plan_workout_exercises)")
    .all()
    .some((column) => column.name === "performed_sets");

  if (!hasColumn) {
    database.exec("ALTER TABLE plan_workout_exercises ADD COLUMN performed_sets TEXT");
  }

  const rows = database
    .prepare(
      `SELECT id, sets, reps, weight, duration, performed_sets
       FROM plan_workout_exercises
       WHERE performed_sets IS NULL OR performed_sets = ''`,
    )
    .all();
  const update = database.prepare(
    "UPDATE plan_workout_exercises SET performed_sets = ? WHERE id = ?",
  );

  const transaction = database.transaction(() => {
    for (const row of rows) {
      const performedSets = normalizePerformedSets(row);
      update.run(JSON.stringify(performedSets), row.id);
    }
  });
  transaction();
}

function ensureUserRoleConstraint(database) {
  const table = database
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get();

  if (!table?.sql || table.sql.includes("'trainer'")) return;

  database.exec(`
    PRAGMA foreign_keys = OFF;
    BEGIN TRANSACTION;

    CREATE TABLE users_new (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'user', 'trainer')) DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO users_new (id, username, password_hash, role, created_at, updated_at)
    SELECT id, username, password_hash,
      CASE role WHEN 'owner' THEN 'owner' WHEN 'trainer' THEN 'trainer' ELSE 'user' END,
      created_at, updated_at
    FROM users;

    DROP TABLE users;
    ALTER TABLE users_new RENAME TO users;

    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

function ensurePlanSlugs(database) {
  const columns = database.prepare("PRAGMA table_info(plans)").all();
  const hasSlug = columns.some((column) => column.name === "slug");

  if (!hasSlug) {
    database.exec("ALTER TABLE plans ADD COLUMN slug TEXT");
  }

  const plansWithoutSlugs = database
    .prepare("SELECT id, title FROM plans WHERE slug IS NULL OR slug = ''")
    .all();
  const updateSlug = database.prepare("UPDATE plans SET slug = ? WHERE id = ?");

  const transaction = database.transaction(() => {
    for (const plan of plansWithoutSlugs) {
      updateSlug.run(createUniquePlanSlug(database, plan.title), plan.id);
    }
  });
  transaction();

  database.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug)");
}

function seed(database) {
  seedOwner(database);
  seedAppShareUser(database);
}

function seedOwner(database) {
  const username = String(process.env.ADMIN_USERNAME || "").trim();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!username || !password) return;

  const existing = database
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (existing) return;

  database
    .prepare(
      "INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
    )
    .run(randomUUID(), username, bcrypt.hashSync(password, 12), "owner");
}

function seedAppShareUser(database) {
  const existing = database
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(APP_SHARE_USERNAME);

  if (existing) return existing.id;

  const id = randomUUID();
  database
    .prepare("INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(id, APP_SHARE_USERNAME, bcrypt.hashSync(randomBytes(32).toString("hex"), 12), "user");
  return id;
}

export function getAppShareUser() {
  const database = db();
  const user = database.prepare("SELECT * FROM users WHERE username = ?").get(APP_SHARE_USERNAME);
  if (user) return user;

  seedAppShareUser(database);
  return database.prepare("SELECT * FROM users WHERE username = ?").get(APP_SHARE_USERNAME);
}

export function isAppSharedPlan(plan) {
  return plan?.owner_username === APP_SHARE_USERNAME;
}

export function getUserByUsername(username) {
  return db().prepare("SELECT * FROM users WHERE username = ?").get(username);
}

export function getUserById(id) {
  return db().prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function listUsers() {
  return db()
    .prepare(
      "SELECT id, username, role, created_at, updated_at FROM users WHERE username != ? ORDER BY username COLLATE NOCASE",
    )
    .all(APP_SHARE_USERNAME);
}

export function getUser(id) {
  return db()
    .prepare("SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?")
    .get(id);
}

export function isValidUserRole(role) {
  return USER_ROLES.includes(role);
}

export function createUser({ username, password, role }) {
  if (!isValidUserRole(role)) {
    throw new Error("Invalid role");
  }
  if (username === APP_SHARE_USERNAME) {
    throw new Error("Invalid username");
  }

  const id = randomUUID();
  db()
    .prepare("INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(id, username, bcrypt.hashSync(password, 12), role);
  return id;
}

export function updateUser({ id, username, password, role }) {
  if (!isValidUserRole(role)) {
    throw new Error("Invalid role");
  }

  const database = db();
  const existing = database.prepare("SELECT id, role, username FROM users WHERE id = ?").get(id);
  if (!existing) return false;
  if (existing.username === APP_SHARE_USERNAME || username === APP_SHARE_USERNAME) {
    throw new Error("Invalid username");
  }

  if (existing.role === "owner" && role !== "owner" && countOwners(database) <= 1) {
    throw new Error("Cannot remove the last owner");
  }

  const transaction = database.transaction(() => {
    database
      .prepare("UPDATE users SET username = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(username, role, id);

    if (password) {
      database
        .prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(bcrypt.hashSync(password, 12), id);
    }
  });

  transaction();
  return true;
}

function countOwners(database = db()) {
  return database.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'owner'").get().count;
}

export function listExercises() {
  const database = db();
  const exercises = database
    .prepare("SELECT * FROM exercises ORDER BY name COLLATE NOCASE")
    .all();
  const aliasesForExercise = database.prepare(
    "SELECT alias FROM exercise_aliases WHERE exercise_id = ? ORDER BY alias COLLATE NOCASE",
  );

  return exercises.map((exercise) => ({
    ...exercise,
    aliases: aliasesForExercise.all(exercise.id).map((row) => row.alias),
  }));
}

export function listExercisesForJson() {
  return listExercises().map((exercise) => {
    const row = {
      equipment: equipmentForJson(exercise.equipment),
      measurement: exercise.measurement,
      name: exercise.name,
      note: exercise.note,
      sets: exercise.sets,
      type: exercise.type,
      video: exercise.video,
    };
    if (exercise.reps !== null) row.reps = exercise.reps;
    if (exercise.weight !== null) row.weight = exercise.weight;
    if (exercise.duration !== null) row.duration = exercise.duration;
    if (exercise.aliases.length > 0) row.alias = exercise.aliases;
    return row;
  });
}

export function getExercise(id) {
  const database = db();
  const exercise = database.prepare("SELECT * FROM exercises WHERE id = ?").get(id);
  if (!exercise) return null;
  const aliases = database
    .prepare("SELECT alias FROM exercise_aliases WHERE exercise_id = ? ORDER BY alias COLLATE NOCASE")
    .all(id)
    .map((row) => row.alias);
  return { ...exercise, aliases };
}

export function upsertExercise(input) {
  const database = db();
  const id = input.id || randomUUID();
  const aliases = splitAliases(input.aliases);
  const transaction = database.transaction(() => {
    database
      .prepare(
        `INSERT INTO exercises (id, name, measurement, type, note, sets, reps, weight, duration, video, equipment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          measurement = excluded.measurement,
          type = excluded.type,
          note = excluded.note,
          sets = excluded.sets,
          reps = excluded.reps,
          weight = excluded.weight,
          duration = excluded.duration,
          video = excluded.video,
          equipment = excluded.equipment,
          updated_at = CURRENT_TIMESTAMP`,
      )
      .run(
        id,
        input.name,
        emptyToNull(input.measurement),
        emptyToNull(input.type),
        emptyToNull(input.note),
        numberOrNull(input.sets),
        numberOrNull(input.reps),
        numberOrNull(input.weight),
        numberOrNull(input.duration),
        emptyToNull(input.video),
        parseExerciseEquipment(input.equipment),
      );
    database.prepare("DELETE FROM exercise_aliases WHERE exercise_id = ?").run(id);
    for (const alias of aliases) {
      database
        .prepare("INSERT OR IGNORE INTO exercise_aliases (id, exercise_id, alias) VALUES (?, ?, ?)")
        .run(randomUUID(), id, alias);
    }
  });
  transaction();
  return id;
}

export function deleteExercise(id) {
  db().prepare("DELETE FROM exercises WHERE id = ?").run(id);
}

export function listPlansForUser(userId) {
  return db()
    .prepare("SELECT * FROM plans WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId);
}

export function getPlan(id, userId = null, publicOnly = false) {
  const database = db();
  const conditions = ["p.id = ?"];
  const params = [id];
  if (userId) {
    conditions.push("p.user_id = ?");
    params.push(userId);
  }
  if (publicOnly) {
    conditions.push("p.is_public = 1");
  }

  const plan = database
    .prepare(`SELECT p.*, u.username AS owner_username FROM plans p JOIN users u ON u.id = p.user_id WHERE ${conditions.join(" AND ")}`)
    .get(...params);
  return hydratePlan(database, plan);
}

export function getPublicPlanByIdentifier(identifier) {
  const database = db();
  const plan = database
    .prepare(
      `SELECT p.*, u.username AS owner_username
       FROM plans p
       JOIN users u ON u.id = p.user_id
       WHERE p.is_public = 1 AND (p.slug = ? OR p.id = ?)
       LIMIT 1`,
    )
    .get(identifier, identifier);

  return hydratePlan(database, plan);
}

export function listAppSharedPlans() {
  const shareUser = getAppShareUser();
  return listPlansForUser(shareUser.id);
}

export function createSharedPlan(input) {
  const shareUser = getAppShareUser();
  const planId = createPlanForUser(shareUser.id, { ...input, is_public: true });
  return getPlan(planId);
}

export function createPlanForUser(userId, input) {
  const database = db();
  const planId = randomUUID();
  const slug = createUniquePlanSlug(database, input.title);
  const transaction = database.transaction(() => {
    database
      .prepare(
        "INSERT INTO plans (id, user_id, slug, title, goal, description, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        planId,
        userId,
        slug,
        input.title,
        emptyToNull(input.goal),
        emptyToNull(input.description),
        input.is_public ? 1 : 0,
      );
    savePlanWorkouts(database, planId, input.workouts || []);
  });
  transaction();
  return planId;
}

export function updatePlanForUser(planId, userId, input) {
  const database = db();
  const existing = database
    .prepare("SELECT id FROM plans WHERE id = ? AND user_id = ?")
    .get(planId, userId);
  if (!existing) return false;

  const transaction = database.transaction(() => {
    database
      .prepare(
        `UPDATE plans
         SET title = ?, goal = ?, description = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
      )
      .run(
        input.title,
        emptyToNull(input.goal),
        emptyToNull(input.description),
        input.is_public ? 1 : 0,
        planId,
        userId,
      );
    database.prepare("DELETE FROM plan_workouts WHERE plan_id = ?").run(planId);
    savePlanWorkouts(database, planId, input.workouts || []);
  });
  transaction();
  return true;
}

export function deletePlanForUser(planId, userId) {
  return db().prepare("DELETE FROM plans WHERE id = ? AND user_id = ?").run(planId, userId);
}

export function deletePlan(planId) {
  return db().prepare("DELETE FROM plans WHERE id = ?").run(planId);
}

function savePlanWorkouts(database, planId, workouts) {
  const findExercise = database.prepare(
    `SELECT id FROM exercises
     WHERE name = ?
     OR id IN (SELECT exercise_id FROM exercise_aliases WHERE alias = ?)
     LIMIT 1`,
  );
  const insertWorkout = database.prepare(
    "INSERT INTO plan_workouts (id, plan_id, name, position) VALUES (?, ?, ?, ?)",
  );
  const insertExercise = database.prepare(
    `INSERT INTO plan_workout_exercises
     (id, workout_id, exercise_id, exercise_name, position, sets, reps, weight, duration, performed_sets)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  workouts.forEach((workout, workoutIndex) => {
    if (!workout.name?.trim()) return;
    const workoutId = randomUUID();
    insertWorkout.run(workoutId, planId, workout.name.trim(), workoutIndex);
    (workout.exercises || []).forEach((exercise, exerciseIndex) => {
      const exerciseName = exercise.exercise_name || exercise.exerciseName || "";
      if (!exerciseName.trim()) return;
      const selectedExerciseId = emptyToNull(exercise.exercise_id);
      const matched = selectedExerciseId ? null : findExercise.get(exerciseName, exerciseName);
      const performedSets = normalizePerformedSets(exercise);
      const first = performedSets[0] || {};
      insertExercise.run(
        randomUUID(),
        workoutId,
        selectedExerciseId || matched?.id || null,
        exerciseName.trim(),
        exerciseIndex,
        numberOrNull(first.sets ?? exercise.sets),
        numberOrNull(first.reps ?? exercise.reps),
        numberOrNull(first.weight ?? exercise.weight),
        numberOrNull(first.duration ?? exercise.duration),
        JSON.stringify(performedSets),
      );
    });
  });
}

function hydratePlan(database, plan) {
  if (!plan) return null;

  const workouts = database
    .prepare("SELECT * FROM plan_workouts WHERE plan_id = ? ORDER BY position, created_at")
    .all(plan.id)
    .map((workout) => ({
      ...workout,
      exercises: database
        .prepare(
          `SELECT pwe.*, e.measurement, e.type, e.note, e.video, e.equipment
           FROM plan_workout_exercises pwe
           LEFT JOIN exercises e ON e.id = pwe.exercise_id
           WHERE pwe.workout_id = ?
           ORDER BY pwe.position, pwe.created_at`,
        )
        .all(workout.id)
        .map(hydratePlanExercise),
    }));

  return { ...plan, is_public: Boolean(plan.is_public), workouts };
}

function hydratePlanExercise(exercise) {
  const performedSets = normalizePerformedSets(exercise);
  const first = performedSets[0] || {};
  return {
    ...exercise,
    performedSets,
    sets: first.sets ?? exercise.sets,
    reps: first.reps ?? exercise.reps,
    weight: first.weight ?? exercise.weight,
    duration: first.duration ?? exercise.duration,
  };
}

function createUniquePlanSlug(database, title) {
  const exists = database.prepare("SELECT 1 FROM plans WHERE slug = ?");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const slug = `${slugify(title)}-${randomBytes(4).toString("hex")}`;
    if (!exists.get(slug)) return slug;
  }
  return `${slugify(title)}-${randomUUID()}`;
}

function slugify(value) {
  const slug = String(value || "workout-plan")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "workout-plan";
}

export function planInputFromForm(formData) {
  const workoutNames = formData.getAll("workout_name");
  const exerciseNames = formData.getAll("exercise_name");
  const exerciseIds = formData.getAll("exercise_id");
  const sets = formData.getAll("sets");
  const reps = formData.getAll("reps");
  const weights = formData.getAll("weight");
  const durations = formData.getAll("duration");
  const performedSetsFields = formData.getAll("performed_sets");
  const workoutIndexes = formData.getAll("workout_index");

  const workouts = workoutNames.map((name, index) => ({
    name: String(name),
    exercises: exerciseIds
      .map((exerciseId, exerciseIndex) => ({
        exercise_name: String(exerciseNames[exerciseIndex] || ""),
        exercise_id: String(exerciseId || ""),
        sets: sets[exerciseIndex],
        reps: reps[exerciseIndex],
        weight: weights[exerciseIndex],
        duration: durations[exerciseIndex],
        performedSets: parseFormPerformedSets(performedSetsFields[exerciseIndex]),
        workout_index: Number(workoutIndexes[exerciseIndex]),
      }))
      .filter((exercise) => exercise.workout_index === index),
  }));

  return {
    title: String(formData.get("title") || "Untitled plan").trim(),
    goal: String(formData.get("goal") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    is_public: formData.get("is_public") === "on",
    workouts,
  };
}

function parseFormPerformedSets(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function splitAliases(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/\r?\n|,/)
    .map((alias) => alias.trim())
    .filter(Boolean);
}

function emptyToNull(value) {
  const normalized = String(value ?? "").trim();
  return normalized === "" ? null : normalized;
}

function numberOrNull(value) {
  const normalized = String(value ?? "").trim();
  if (normalized === "") return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}
