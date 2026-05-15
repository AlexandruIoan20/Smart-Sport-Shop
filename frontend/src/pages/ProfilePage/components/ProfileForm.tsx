import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  GOAL_OPTIONS,
  ENVIRONMENT_OPTIONS,
  DAILY_SCHEDULE_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  EFFORT_TOLERANCE_OPTIONS,
  PREFERS_TEAM_OPTIONS,
} from "@/constants/enums"

const formSchema = z.object({
  occupation: z.string().optional(),
  medicalNotes: z.string().optional(),

  goal: z.enum(
    [
      "WEIGHT_LOSS",
      "MUSCLE_GAIN",
      "CARDIO",
      "STRESS_RELIEF",
      "FLEXIBILITY",
    ],
    { error: "Camp obligatoriu" }
  ),

  preferredEnvironment: z.enum(
    ["INDOOR", "OUTDOOR", "BOTH"],
    { error: "Camp obligatoriu" }
  ),

  dailySchedule: z.enum(
    [
      "FULL_TIME",
      "PART_TIME",
      "FLEXIBLE",
      "STUDENT",
      "RETIRED",
    ],
    { error: "Camp obligatoriu" }
  ),

  activityLevel: z.enum(
    [
      "SEDENTARY",
      "LIGHT",
      "MODERATE",
      "ACTIVE",
      "VERY_ACTIVE",
    ],
    { error: "Camp obligatoriu" }
  ),

  effortTolerance: z.enum(
    ["LOW", "MEDIUM", "HIGH"],
    { error: "Camp obligatoriu" }
  ),

  prefersTeam: z.enum(
    ["true", "false"],
    { error: "Camp obligatoriu" }
  ),

  freeHoursWeek: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Camp obligatoriu"
          : "Introdu un număr",
    })
    .min(0, "Minim 0")
    .max(168, "Maxim 168"),

  budgetMin: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Camp obligatoriu"
          : "Introdu un număr",
    })
    .min(0, "Minim 0"),

  budgetMax: z.coerce
    .number({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Camp obligatoriu"
          : "Introdu un număr",
    })
    .min(0, "Minim 0"),
}).refine((d) => d.budgetMax >= d.budgetMin, {
  message: "Bugetul maxim trebuie să fie mai mare decât minimul",
  path: ["budgetMax"],
})

type FormValues = z.infer<typeof formSchema>

const USER_ID = localStorage.getItem("userId") ?? ""

const inputCls =
  "bg-zinc-950 border-zinc-800 text-zinc-100"

const selectCls =
  "bg-zinc-900 border-zinc-700 text-zinc-100"

export default function ProfileForm() {
  const navigate = useNavigate(); 

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    mode: "onSubmit",

    defaultValues: {
      occupation: "",
      medicalNotes: "",
    },
  })

  useEffect(() => {
    if (!USER_ID) return

    async function fetchProfile() {
      try {
        const res = await fetch(
          "http://localhost:8081/api/profiles",
          {
            headers: {
              "X-User-Id": USER_ID,
            },
          }
        )

        const data = await res.json()

        if (res.ok && data.exists !== false) {
          form.reset({
            occupation: data.occupation ?? "",
            medicalNotes: data.medicalNotes ?? "",

            goal: data.goal ?? undefined,

            preferredEnvironment:
              data.preferredEnvironment ?? undefined,

            dailySchedule:
              data.dailySchedule ?? undefined,

            activityLevel:
              data.activityLevel ?? undefined,

            effortTolerance:
              data.effortTolerance ?? undefined,

            prefersTeam:
              data.prefersTeam !== null &&
              data.prefersTeam !== undefined
                ? String(data.prefersTeam) as
                    | "true"
                    | "false"
                : undefined,

            freeHoursWeek:
              data.freeHoursWeek ?? undefined,

            budgetMin:
              data.budgetMin ?? undefined,

            budgetMax:
              data.budgetMax ?? undefined,
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchProfile()
  }, [form])

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      prefersTeam:  values.prefersTeam === "true",
      occupation:   values.occupation?.trim()   || null,
      medicalNotes: values.medicalNotes?.trim() || null,
    }

    try {
      const res = await fetch("http://localhost:8081/api/profiles/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id":    USER_ID,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("Eroare la salvare: " + data.error)
        return
      }

      localStorage.setItem("sessionId", data.sessionId)
      
      window.dispatchEvent(new Event("profile-saved"))
      navigate("/recommendations")

    } catch {
      alert("Eroare conexiune server.")
    }
  }
  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Profilul tău sportiv
        </CardTitle>

        <CardDescription className="text-zinc-400">
          Câmpurile cu * sunt obligatorii.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ocupație
                  </FormLabel>

                  <FormControl>
                    <Input
                      className={inputCls}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Obiectiv principal{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {GOAL_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mediu preferat{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {ENVIRONMENT_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailySchedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Program zilnic{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {DAILY_SCHEDULE_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nivel de activitate{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effortTolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Toleranță la efort{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {EFFORT_TOLERANCE_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prefersTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tip sport preferat{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Selectează" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className={selectCls}>
                        {PREFERS_TEAM_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="freeHoursWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ore libere / săptămână{" "}
                    <span className="text-red-400">*</span>
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={168}
                      className={inputCls}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Buget minim (RON){" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className={inputCls}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Buget maxim (RON){" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className={inputCls}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medicalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Restricții medicale / Note
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      rows={3}
                      className={`${inputCls} resize-none`}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Se salvează..."
                : "Salvează profilul"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}