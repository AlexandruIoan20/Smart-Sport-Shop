import { useEffect, useState } from "react"
import type { FullRecommendation } from "@/types"
import RecommendedProductCard from "./components/RecommendedProductCard"
import RecommendedSportCard from "./components/RecommendedSportCard"

const USER_ID = localStorage.getItem("userId") ?? ""

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:     "Începător",
  INTERMEDIATE: "Intermediar",
  ADVANCED:     "Avansat",
}

export default function RecommendationsPage() {
  const [data,    setData]    = useState<FullRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()

    window.addEventListener("profile-saved", loadRecommendations)
    return () => window.removeEventListener("profile-saved", loadRecommendations)
  }, [])

  async function loadRecommendations() {
    if (!USER_ID) return

    setLoading(true)
    setError(null)

    try {
      const res  = await fetch("http://localhost:8081/api/recommendations/latest", {
        headers: { "X-User-Id": USER_ID },
      })
      const json = await res.json()

      if (!res.ok) {
        if (json.error === "NO_RECOMMENDATIONS_FOUND") {
          setData(null)
        } else {
          setError(json.error)
        }
        return
      }

      setData(json)
    } catch {
      setError("Nu ne-am putut conecta la server.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-lg bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">
        <p className="text-red-400">{error}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-zinc-500">
            Nu există recomandări încă. Completează-ți profilul mai întâi.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Recomandările tale
          </h1>
          <p className="text-zinc-400 mt-1">
            Bazate pe profilul tău sportiv · Actualizat{" "}
            {new Date(data.createdAt).toLocaleDateString("ro-RO")}
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold">
          {LEVEL_LABELS[data.userLevel] ?? data.userLevel}
        </div>
      </div>

      {/* Sporturi */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Sporturi recomandate
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.sports.map(sport => (
            <RecommendedSportCard key={sport.sportId} sport={sport} />
          ))}
        </div>
      </section>

      {/* Produse */}
      {data.products.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Echipamente recomandate
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {data.products.map(product => (
              <RecommendedProductCard key={product.productId} product={product} />
            ))}
          </div>
        </section>
      )}

    </main>
  )
}