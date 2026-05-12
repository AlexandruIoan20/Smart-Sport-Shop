import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GOAL_OPTIONS, ENVIRONMENT_OPTIONS, DAILY_SCHEDULE_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS, EFFORT_TOLERANCE_OPTIONS, PREFERS_TEAM_OPTIONS,
} from "@/constants/enums"

const formSchema = z.object({
  occupation:           z.string().optional(),
  goal:                 z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "CARDIO", "STRESS_RELIEF", "FLEXIBILITY"] as const),
  preferredEnvironment: z.enum(["INDOOR", "OUTDOOR", "BOTH"] as const),
  dailySchedule:        z.enum(["FULL_TIME", "PART_TIME", "FLEXIBLE", "STUDENT", "RETIRED"] as const),
  freeHoursWeek:        z.coerce.number().min(0).max(168),
  activityLevel:        z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"] as const),
  effortTolerance:      z.enum(["LOW", "MEDIUM", "HIGH"] as const),
  prefersTeam:          z.enum(["true", "false"] as const),
  medicalNotes:         z.string().optional(),
  budgetMin:            z.coerce.number().min(0),
  budgetMax:            z.coerce.number().min(0),
}).refine(d => d.budgetMax >= d.budgetMin, {
  message: "Bugetul maxim trebuie să fie mai mare decât minimul",
  path: ["budgetMax"],
})

type FormValues = z.infer<typeof formSchema>

const USER_ID       = localStorage.getItem("userId") ?? ""
const inputCls      = "bg-zinc-950 border-zinc-800 text-zinc-100"
const selectCls     = "bg-zinc-900 border-zinc-700 text-zinc-100"

function SelectField({
  name, label, options, control,
}: {
  name:    keyof FormValues
  label:   string
  options: readonly { value: string; label: string }[]
  control: any
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value as string}>
          <FormControl>
            <SelectTrigger className={inputCls}>
              <SelectValue placeholder={`Alege ${label.toLowerCase()}`} />
            </SelectTrigger>
          </FormControl>
          <SelectContent className={selectCls}>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage className="text-red-400" />
      </FormItem>
    )} />
  )
}

export default function ProfileForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      occupation:           "",
      goal:                 "CARDIO",
      preferredEnvironment: "BOTH",
      dailySchedule:        "FULL_TIME",
      freeHoursWeek:        5,
      activityLevel:        "MODERATE",
      effortTolerance:      "MEDIUM",
      prefersTeam:          "false",
      medicalNotes:         "",
      budgetMin:            0,
      budgetMax:            500,
    },
  })

  useEffect(() => {
    if (!USER_ID) return

    async function fetchProfile() {
      try {
        const res  = await fetch("http://localhost:8081/api/profiles", {
          headers: { "X-User-Id": USER_ID },
        })
        const data = await res.json()

        if (res.ok && data.exists !== false) {
          form.reset({
            occupation:           data.occupation           ?? "",
            goal:                 data.goal                 ?? "CARDIO",
            preferredEnvironment: data.preferredEnvironment ?? "BOTH",
            dailySchedule:        data.dailySchedule        ?? "FULL_TIME",
            freeHoursWeek:        data.freeHoursWeek        ?? 5,
            activityLevel:        data.activityLevel        ?? "MODERATE",
            effortTolerance:      data.effortTolerance      ?? "MEDIUM",
            prefersTeam:          data.prefersTeam !== null
                                    ? String(data.prefersTeam) as "true" | "false"
                                    : "false",
            medicalNotes:         data.medicalNotes         ?? "",
            budgetMin:            data.budgetMin             ?? 0,
            budgetMax:            data.budgetMax             ?? 500,
          })
        }
      } catch (err) {
        console.error("Nu s-a putut încărca profilul:", err)
      }
    }

    fetchProfile()
  }, [form])

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("http://localhost:8081/api/profiles/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id":    USER_ID,
        },
        body: JSON.stringify({
          ...values,
          prefersTeam: values.prefersTeam === "true",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes("BUDGET_INVALID")) {
          form.setError("budgetMax", {
            type:    "manual",
            message: "Bugetul maxim trebuie să fie mai mare decât minimul",
          })
        } else {
          alert("Eroare: " + data.error)
        }
        return
      }

      alert("Profil salvat cu succes!")
    } catch (err) {
      console.error(err)
      alert("Nu ne-am putut conecta la server.")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Profilul tău sportiv</CardTitle>
        <CardDescription className="text-zinc-400">
          Completează informațiile pentru recomandări personalizate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            <FormField control={form.control} name="occupation" render={({ field }) => (
              <FormItem>
                <FormLabel>Ocupație</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Inginer, Student..." className={inputCls} {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                name="goal"
                label="Obiectiv principal"
                options={GOAL_OPTIONS}
                control={form.control}
              />
              <SelectField
                name="preferredEnvironment"
                label="Mediu preferat"
                options={ENVIRONMENT_OPTIONS}
                control={form.control}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                name="dailySchedule"
                label="Program zilnic"
                options={DAILY_SCHEDULE_OPTIONS}
                control={form.control}
              />
              <SelectField
                name="activityLevel"
                label="Nivel de activitate"
                options={ACTIVITY_LEVEL_OPTIONS}
                control={form.control}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                name="effortTolerance"
                label="Toleranță la efort"
                options={EFFORT_TOLERANCE_OPTIONS}
                control={form.control}
              />
              <SelectField
                name="prefersTeam"
                label="Tip sport preferat"
                options={PREFERS_TEAM_OPTIONS}
                control={form.control}
              />
            </div>

            <FormField control={form.control} name="freeHoursWeek" render={({ field }) => (
              <FormItem>
                <FormLabel>Ore libere pe săptămână</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={168} className={inputCls} {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="budgetMin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Buget minim (RON)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={form.control} name="budgetMax" render={({ field }) => (
                <FormItem>
                  <FormLabel>Buget maxim (RON)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} className={inputCls} {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="medicalNotes" render={({ field }) => (
              <FormItem>
                <FormLabel>Restricții medicale / Note</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ex: probleme cu genunchiul, hernie de disc..."
                    className={`${inputCls} resize-none`}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Se salvează..." : "Salvează profilul"}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}