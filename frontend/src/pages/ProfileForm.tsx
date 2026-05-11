import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const profileSchema = z.object({
  occupation: z.string().min(2, "Ocupația este obligatorie"),
  goal: z.enum(["weight_loss", "muscle_gain", "cardio", "stress_relief", "flexibility"]),
  preferredEnvironment: z.enum(["indoor", "outdoor", "both"]),
  dailySchedule: z.enum(["morning", "afternoon", "night"]),
  freeHoursWeek: z.number().min(1).max(168),
  activityLevel: z.enum(["sedentary", "beginner", "intermediate", "advanced"]),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
})

export default function ProfileForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      occupation: "",
      goal: "weight_loss",
      preferredEnvironment: "indoor",
      dailySchedule: "morning",
      freeHoursWeek: 5,
      activityLevel: "sedentary", // camelCase corect
      budgetMin: 0,
      budgetMax: 500,
    },
  })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    const userId = localStorage.getItem("userId")
    if (!userId) { navigate("/login"); return; }

    try {
      const response = await fetch("http://localhost:8081/api/profiles/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": userId },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        alert("Profil salvat!")
        navigate("/dashboard")
      }
    } catch (error) { console.error(error); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-500">Finalizare Profil</CardTitle>
          <CardDescription>Pasul {step} din 3</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <FormField control={form.control} name="occupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocupație</FormLabel>
                      <FormControl><Input className="bg-zinc-950" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel activitate</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="bg-zinc-950"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="bg-zinc-900 text-white">
                          <SelectItem value="sedentary">Sedentar</SelectItem>
                          <SelectItem value="beginner">Începător</SelectItem>
                          <SelectItem value="intermediate">Intermediar</SelectItem>
                          <SelectItem value="advanced">Avansat</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <Button type="button" onClick={() => setStep(2)}>Înainte</Button>
                </div>
              )}
              {/* Adaugă analog pașii 2 și 3 asigurându-te că 'name' corespunde camelCase-ului din schemă */}
              {step === 3 && (
                <Button type="submit">Finalizează</Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}