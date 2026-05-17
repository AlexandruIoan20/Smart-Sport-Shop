import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, AlertCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(1, "Parola este obligatorie"),
})

export default function Login() {
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        form.setError("root", {
          message: data.error || "Eroare la autentificare",
        })
        return
      }

      localStorage.setItem("userId", data.userId)
      navigate("/dashboard")

    } catch (error) {
      form.setError("root", {
        message: "Serverul nu răspunde. Verifică dacă Spring Boot rulează.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 bg-blue-600/10 rounded-full">
              <LogIn className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Bine ai revenit</CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Introdu datele pentru a intra în cont
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Eroare globală (server sau rețea) */}
              {form.formState.errors.root && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nume@exemplu.com"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Parolă</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 disabled:opacity-60"
              >
                {form.formState.isSubmitting ? "Se autentifică..." : "Autentificare"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-400">Nu ai cont? </span>
            <button
              onClick={() => navigate("/register")}
              className="text-blue-500 hover:underline"
            >
              Înregistrează-te
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}