export const GOAL_OPTIONS = [
  { value: "WEIGHT_LOSS",   label: "Slăbire" },
  { value: "MUSCLE_GAIN",   label: "Creștere musculară" },
  { value: "CARDIO",        label: "Cardio / Rezistență" },
  { value: "STRESS_RELIEF", label: "Relaxare / Anti-stres" },
  { value: "FLEXIBILITY",   label: "Flexibilitate" },
] as const

export const ENVIRONMENT_OPTIONS = [
  { value: "INDOOR",  label: "Interior" },
  { value: "OUTDOOR", label: "Exterior" },
  { value: "BOTH",    label: "Ambele" },
] as const

export const DAILY_SCHEDULE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "FLEXIBLE",  label: "Program flexibil" },
  { value: "STUDENT",   label: "Student" },
  { value: "RETIRED",   label: "Pensionar" },
] as const

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "SEDENTARY",   label: "Sedentar" },
  { value: "LIGHT",       label: "Ușor activ" },
  { value: "MODERATE",    label: "Moderat" },
  { value: "ACTIVE",      label: "Activ" },
  { value: "VERY_ACTIVE", label: "Foarte activ" },
] as const

export const EFFORT_TOLERANCE_OPTIONS = [
  { value: "LOW",    label: "Scăzut — prefer activități ușoare" },
  { value: "MEDIUM", label: "Mediu — accept efort moderat" },
  { value: "HIGH",   label: "Ridicat — vreau să mă depășesc" },
] as const

export const PREFERS_TEAM_OPTIONS = [
  { value: "true",  label: "Prefer sport în echipă" },
  { value: "false", label: "Prefer sport individual" },
] as const

export type GoalType            = typeof GOAL_OPTIONS[number]["value"]
export type EnvironmentType     = typeof ENVIRONMENT_OPTIONS[number]["value"]
export type DailyScheduleType   = typeof DAILY_SCHEDULE_OPTIONS[number]["value"]
export type ActivityLevelType   = typeof ACTIVITY_LEVEL_OPTIONS[number]["value"]
export type EffortToleranceType = typeof EFFORT_TOLERANCE_OPTIONS[number]["value"]