import fs from "node:fs";
import path from "node:path";
import { planInputFromTemplateSet } from "./plan-json";

export function getPlanTemplates() {
  const raw = fs.readFileSync(path.join(process.cwd(), "PlanTemplateDefaults.json"), "utf8");
  const data = JSON.parse(raw);
  return data.planSets || [];
}

export function getTemplatePlanInput(templateId) {
  const templates = getPlanTemplates();
  const template = templates.find((item) => item.id === templateId);
  if (!template) return null;

  return planInputFromTemplateSet(template, { isPublic: false });
}
