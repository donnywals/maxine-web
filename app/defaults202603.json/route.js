import { listExercisesForJson } from "../../lib/db";

export async function GET() {
  return Response.json(listExercisesForJson(), {
    headers: {
      "cache-control": "no-store",
    },
  });
}
