import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// ----------------------------------------------------------------
// Constante
// ----------------------------------------------------------------
const STEPS = [
  { id: "goal",                 label: "Obiectiv" },
  { id: "environment",          label: "Mediu" },
  { id: "activity",             label: "Activitate" },
  { id: "schedule",             label: "Program" },
  { id: "effort",               label: "Efort" },
  { id: "team",                 label: "Echipă" },
  { id: "hours",                label: "Timp" },
]

const GOAL_OPTIONS = [
  { value: "WEIGHT_LOSS",   label: "Slăbire" },
  { value: "MUSCLE_GAIN",   label: "Creștere musculară" },
  { value: "CARDIO",        label: "Cardio / Rezistență" },
  { value: "STRESS_RELIEF", label: "Relaxare / Anti-stres" },
  { value: "FLEXIBILITY",   label: "Flexibilitate" },
]

const ENVIRONMENT_OPTIONS = [
  { value: "INDOOR",  label: "Interior — sală, piscină, studio" },
  { value: "OUTDOOR", label: "Exterior — parc, munte, teren" },
  { value: "BOTH",    label: "Nu contează, ambele îmi convin" },
]

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY",   label: "Sedentar — stau mai mult jos" },
  { value: "LIGHT",       label: "Ușor activ — mers pe jos ocazional" },
  { value: "MODERATE",    label: "Moderat — sport de 1-2 ori pe săptămână" },
  { value: "ACTIVE",      label: "Activ — sport de 3-4 ori pe săptămână" },
  { value: "VERY_ACTIVE", label: "Foarte activ — antrenament zilnic" },
]

const SCHEDULE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time — program fix 9-17" },
  { value: "PART_TIME", label: "Part-time — program parțial" },
  { value: "FLEXIBLE",  label: "Flexibil — îmi aleg orele" },
  { value: "STUDENT",   label: "Student — ore libere variate" },
  { value: "RETIRED",   label: "Pensionar — timp liber mult" },
]

const EFFORT_OPTIONS = [
  { value: "LOW",    label: "Scăzut — prefer activități ușoare" },
  { value: "MEDIUM", label: "Mediu — accept efort moderat" },
  { value: "HIGH",   label: "Ridicat — vreau să mă depășesc" },
]

const TEAM_OPTIONS = [
  { value: "true",  label: "Prefer sport în echipă sau grup" },
  { value: "false", label: "Prefer sport individual" },
]

// ----------------------------------------------------------------
// Schema Zod
// ----------------------------------------------------------------
const formSchema = z.object({
  goal:                 z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "CARDIO", "STRESS_RELIEF", "FLEXIBILITY"]),
  preferredEnvironment: z.enum(["INDOOR", "OUTDOOR", "BOTH"]),
  activityLevel:        z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]),
  dailySchedule:        z.enum(["FULL_TIME", "PART_TIME", "FLEXIBLE", "STUDENT", "RETIRED"]),
  effortTolerance:      z.enum(["LOW", "MEDIUM", "HIGH"]),
  prefersTeam:          z.enum(["true", "false"]),
  freeHoursWeek:        z.coerce.number().min(1, "Minim 1 oră").max(168, "Maxim 168 ore"),
})

type FormValues = z.infer<typeof formSchema>

// ----------------------------------------------------------------
// Tipul pentru rezultat
// ----------------------------------------------------------------
type RecommendedSport = {
  sportId:            string
  sportName:          string
  compatibilityScore: number
  rank:               number
}

type QuestionnaireResult = {
  sessionId:         string
  computedLevel:     string
  recommendedSports: RecommendedSport[]
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     "Începător",
  INTERMEDIATE: "Intermediar",
  ADVANCED:     "Avansat",
}

const USER_ID = localStorage.getItem("userId") ?? ""

// ----------------------------------------------------------------
// Componente mici
// ----------------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1.5">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
            transition-colors duration-200
            ${i < current  ? "bg-blue-600 text-white" : ""}
            ${i === current ? "bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-900" : ""}
            ${i > current  ? "bg-zinc-800 text-zinc-500" : ""}
          `}>
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-4 ${i < current ? "bg-blue-600" : "bg-zinc-700"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function OptionCard({
  value, label, selected, onClick,
}: {
  value: string; label: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 text-sm
        ${selected
          ? "border-blue-500 bg-blue-500/10 text-blue-300"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
        }
      `}
    >
      {label}
    </button>
  )
}

function ResultCard({ result }: { result: QuestionnaireResult }) {
  const maxScore = result.recommendedSports[0]?.compatibilityScore ?? 1

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-zinc-400 text-sm">Nivelul tău calculat</p>
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-300 font-semibold text-lg border border-blue-500/30">
          {LEVEL_LABELS[result.computedLevel] ?? result.computedLevel}
        </span>
      </div>

      <div>
        <p className="text-zinc-400 text-sm mb-3">Sporturi recomandate pentru tine</p>
        <div className="space-y-3">
          {result.recommendedSports.map((sport) => {
            const pct = Math.round((sport.compatibilityScore / maxScore) * 100)
            return (
              <div key={sport.sportId} className="bg-zinc-800/60 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 w-4">#{sport.rank}</span>
                    <span className="text-zinc-100 font-medium text-sm">{sport.sportName}</span>
                  </div>
                  <span className="text-blue-400 text-xs">{sport.compatibilityScore} pts</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => window.location.href = "/shop"}
      >
        Vezi echipamentele recomandate →
      </Button>
    </div>
  )
}

// ----------------------------------------------------------------
// Pagina principală
// ----------------------------------------------------------------
export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuestionnaireResult | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  // Câmpul activ per step
  const stepField: (keyof FormValues)[] = [
    "goal",
    "preferredEnvironment",
    "activityLevel",
    "dailySchedule",
    "effortTolerance",
    "prefersTeam",
    "freeHoursWeek",
  ]

  const stepOptions = [
    GOAL_OPTIONS,
    ENVIRONMENT_OPTIONS,
    ACTIVITY_OPTIONS,
    SCHEDULE_OPTIONS,
    EFFORT_OPTIONS,
    TEAM_OPTIONS,
    null, // freeHoursWeek e input numeric
  ]

  async function handleNext() {
    const field = stepField[currentStep]
    const valid = await form.trigger(field)
    if (!valid) return
    setCurrentStep(prev => prev + 1)
  }

  function handleBack() {
    setCurrentStep(prev => prev - 1)
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetch("http://localhost:8081/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": USER_ID,
        },
        body: JSON.stringify({
          goal:                 values.goal,
          preferredEnvironment: values.preferredEnvironment,
          activityLevel:        values.activityLevel,
          dailySchedule:        values.dailySchedule,
          effortTolerance:      values.effortTolerance,
          prefersTeam:          values.prefersTeam,
          freeHoursWeek:        values.freeHoursWeek,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("Eroare: " + data.error)
        return
      }

      setResult(data)
    } catch (err) {
      console.error(err)
      alert("Nu ne-am putut conecta la server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastStep = currentStep === STEPS.length - 1
  const currentFieldName = stepField[currentStep]
  const currentOptions = stepOptions[currentStep]

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {result ? "Recomandările tale" : "Descoperă sportul potrivit"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {result
              ? "Pe baza răspunsurilor tale, iată ce am găsit."
              : `Pasul ${currentStep + 1} din ${STEPS.length} — ${STEPS[currentStep].label}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {result ? (
            <ResultCard result={result} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <StepIndicator current={currentStep} total={STEPS.length} />

                {/* Steps cu OptionCard sau Input numeric */}
                {currentOptions ? (
                  <FormField
                    control={form.control}
                    name={currentFieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300 text-base">
                          {getStepQuestion(currentStep)}
                        </FormLabel>
                        <div className="space-y-2 mt-2">
                          {currentOptions.map(opt => (
                            <OptionCard
                              key={opt.value}
                              value={opt.value}
                              label={opt.label}
                              selected={field.value === opt.value}
                              onClick={() => field.onChange(opt.value)}
                            />
                          ))}
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                ) : (
                  // Step 7 — ore libere
                  <FormField
                    control={form.control}
                    name="freeHoursWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300 text-base">
                          {getStepQuestion(currentStep)}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={168}
                            placeholder="ex: 5"
                            className="bg-zinc-950 border-zinc-800 text-zinc-100 mt-2"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-zinc-500 text-xs mt-1">
                          Include weekenduri și serile libere.
                        </p>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Navigare */}
                <div className="flex gap-3 pt-2">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                      onClick={handleBack}
                    >
                      ← Înapoi
                    </Button>
                  )}

                  {isLastStep ? (
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Se procesează..." : "Obține recomandări →"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleNext}
                    >
                      Continuă →
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ----------------------------------------------------------------
// Helper — întrebările afișate per step
// ----------------------------------------------------------------
function getStepQuestion(step: number): string {
  const questions = [
    "Care este obiectivul tău principal?",
    "Unde preferi să faci sport?",
    "Cum ai descrie nivelul tău actual de activitate?",
    "Care este programul tău zilnic?",
    "Ce nivel de efort ești dispus să depui?",
    "Preferi să faci sport singur sau în grup?",
    "Câte ore pe săptămână poți aloca sportului?",
  ]
  return questions[step] ?? ""
}