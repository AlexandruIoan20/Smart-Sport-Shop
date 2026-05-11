import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from "lucide-react"

// 1. Schema de validare (mai simplă decât la register)
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
        alert(data.error || "Eroare la autentificare")
        return
      }

      localStorage.setItem("userId", data.userId)
      
      alert("Te-ai logat cu succes!")
      navigate("/") 
      
    } catch (error) {
      alert("Serverul nu răspunde. Verifică dacă Spring Boot rulează.")
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nume@exemplu.com" className="bg-zinc-950 border-zinc-800" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parolă</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                Autentificare
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-400">Nu ai cont? </span>
            <button onClick={() => navigate("/register")} className="text-blue-500 hover:underline">
              Înregistrează-te
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}