import { useEffect } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const formSchema = z.object({
  firstName: z.string().min(1, "Camp obligatoriu"),
  lastName:  z.string().min(1, "Camp obligatoriu"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const inputCls = "bg-zinc-950 border-zinc-800 text-zinc-100"

const USER_ID = localStorage.getItem("userId") ?? ""

export default function PersonalDataForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName:  "",
      phone:     "",
      address:   "",
    },
  })

  useEffect(() => {
    if (!USER_ID) return

    async function fetchPersonalData() {
      try {
        const res = await fetch(`http://localhost:8081/api/users/${USER_ID}/personal-data`)
        const data = await res.json()

        if (res.ok) {
          form.reset({
            firstName: data.firstName ?? "",
            lastName:  data.lastName  ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchPersonalData()
  }, [form])

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch(`http://localhost:8081/api/users/${USER_ID}/personal-data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName:  values.lastName,
          phone: values.phone?.trim() || null,
          address: values.address?.trim() || null,
        }),
      })

      if (!res.ok) {
        alert("Eroare la actualizare.")
        return
      }

      alert("Date actualizate cu succes!")
    } catch {
      alert("Eroare conexiune server.")
    }
  }

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Date personale</CardTitle>
        <CardDescription className="text-zinc-400">
          Câmpurile cu * sunt obligatorii.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prenume <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nume <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input className={inputCls} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresă</FormLabel>
                  <FormControl>
                    <Input className={inputCls} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Se salvează..." : "Actualizează datele"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}