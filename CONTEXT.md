# Maxine Web

Owner-managed exercise catalog and workout plans served as JSON for client apps.

## Language

**Measurement**:
How a default prescription is expressed for an exercise (`bodyweight`, `weighted`, `timed`, `timedAndWeight`).
_Avoid_: Equipment, implement, load type.

**Equipment**:
Optional category of implement used for an exercise (`barbell`, `dumbbell`, `kettlebell`, `cable`, `machine`, `band`, `bodyweight`, `other`). Unassigned is null in storage and `"equipment": null` in exported JSON.
_Avoid_: Measurement, type.

**Exercise**:
A named catalog entry with optional aliases, default prescription fields, measurement, equipment, type, note, and video.

## Relationships

- An **Exercise** has at most one **Measurement** and at most one **Equipment** value (or none).

## Example dialogue

> **Dev:** "This exercise has `measurement: bodyweight` — should `equipment` be bodyweight too?"
> **Domain expert:** "Not necessarily. Measurement says reps without external load; equipment says what you use. A push-up can be measurement bodyweight and equipment bodyweight, but a band-assisted pull-up might be measurement bodyweight with equipment band."

## Flagged ambiguities

- `bodyweight` appears in both **Measurement** and **Equipment** — resolved: different concepts; do not merge or rename without a breaking API change.
