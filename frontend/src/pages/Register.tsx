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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const formSchema = z.object({
  username: z.string().min(3, "Username-ul trebuie să aibă minim 3 caractere"),
  email: z.string().email("Format de email invalid"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
  firstName: z.string().min(2, "Prenumele este obligatoriu"),
  lastName: z.string().min(2, "Numele este obligatoriu"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Dată invalidă (folosește YYYY-MM-DD)"),
})

export default function Register() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      birthDate: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("http://localhost:8081/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "Email deja existent") {
          form.setError("email", { type: "manual", message: data.error })
        } else if (data.error === "Username ocupat") {
          form.setError("username", { type: "manual", message: data.error })
        } else {
          form.setError("root", {
            message: data.error || "Eroare la înregistrare",
          })
        }
        return
      }

      form.setError("root", { type: "success", message: "Cont creat cu succes! Vei fi redirecționat..." })
      form.reset()
      setTimeout(() => navigate("/login"), 1500)

    } catch (error) {
      console.error("Eroare de rețea:", error)
      form.setError("root", {
        message: "Nu ne-am putut conecta la server.",
      })
    }
  }

  const rootError = form.formState.errors.root

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Creează un cont</CardTitle>
          <CardDescription className="text-zinc-400">
            Alătură-te platformei Smart Sport Shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Banner eroare globală sau succes */}
              {rootError && (
                rootError.type === "success" ? (
                  <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{rootError.message}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{rootError.message}</span>
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Prenume</FormLabel>
                    <FormControl>
                      <Input placeholder="Ion" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Nume</FormLabel>
                    <FormControl>
                      <Input placeholder="Popescu" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="ion_sportivul" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ion@exemplu.ro" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Parolă</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="birthDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Data nașterii</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 disabled:opacity-60"
              >
                {form.formState.isSubmitting ? "Se creează contul..." : "Înregistrare"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-400">Ai deja un cont? </span>
            <button onClick={() => navigate("/login")} className="text-blue-500 hover:underline">
              Autentifică-te
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}