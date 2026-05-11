import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const formSchema = z.object({
  username: z.string().min(3, "Username-ul trebuie să aibă minim 3 caractere"),
  email: z.string().email("Format de email invalid"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
  firstName: z.string().min(2, "Prenumele este obligatoriu"),
  lastName: z.string().min(2, "Numele este obligatoriu"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Dată invalidă (folosește YYYY-MM-DD)"),
})

export default function Register() {
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
          alert("Eroare la înregistrare: " + data.error)
        }
        return
      }


      alert("Cont creat cu succes! ID: " + data.userId)
      form.reset()
      
    } catch (error) {
      console.error("Eroare de rețea:", error)
      alert("Nu ne-am putut conecta la server.")
    }
  }

  // 4. Interfața vizuală (Dark theme by default din clasa părinte)
  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Creează un cont</CardTitle>
        <CardDescription className="text-zinc-400">
          Alătură-te platformei Smart Sport Shop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prenume</FormLabel>
                  <FormControl><Input placeholder="Ion" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume</FormLabel>
                  <FormControl><Input placeholder="Popescu" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl><Input placeholder="ion_sportivul" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="ion@exemplu.ro" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Parolă</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <FormField control={form.control} name="birthDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Data nașterii</FormLabel>
                <FormControl><Input type="date" className="bg-zinc-950 border-zinc-800" {...field} /></FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )} />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
              Înregistrare
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}