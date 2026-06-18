// Canonical form field types — mirrors the `schema.fields[]` JSON stored in the
// `forms` table (Supabase). Used by the StepForm renderer and any form UI so the
// same data structure powers the lead form, the briefing and the 4 encontros.

export type FieldType = "short" | "long" | "choice" | "multichoice" | "section";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  helper?: string;
  required?: boolean;
  options?: string[];
}

export interface IntroBlock {
  titulo: string;
  texto: string;
}

export interface FormSchema {
  intro?: {
    como_funciona?: IntroBlock[];
    condicoes?: IntroBlock[];
  };
  fields: FormField[];
}

export type FieldValue = string | string[] | undefined;
export type FormAnswers = Record<string, FieldValue>;

/** A renderable step: one input field, optionally preceded by a section header. */
export interface FormStep {
  field: FormField;
  section?: FormField;
}

/** Turn a flat fields[] list (with inline `section` markers) into discrete steps. */
export function buildSteps(fields: FormField[]): FormStep[] {
  const steps: FormStep[] = [];
  let pendingSection: FormField | undefined;
  for (const field of fields) {
    if (field.type === "section") {
      pendingSection = field;
      continue;
    }
    steps.push({ field, section: pendingSection });
    pendingSection = undefined;
  }
  return steps;
}

/** True when a required field has no usable answer yet. */
export function isAnswerEmpty(field: FormField, value: FieldValue): boolean {
  if (field.type === "multichoice") return !Array.isArray(value) || value.length === 0;
  return value === undefined || value === null || String(value).trim() === "";
}
