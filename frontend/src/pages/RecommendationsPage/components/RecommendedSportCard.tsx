import type { RecommendedSport } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export default function RecommendedSportCard({ sport }: { sport: RecommendedSport }) {
  return (
    <Link to={`/sports/${sport.sportId}/products`}>
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden hover:ring-1 hover:ring-zinc-600 transition-all duration-300">

        <div className="h-40 w-full bg-zinc-800 flex items-center justify-center relative">
          <img
            src={sport.imageUrl ?? "https://placehold.co/500x500/27272a/ffffff?text=Sport"}
            alt={sport.sportName}
            className="w-full h-full object-contain p-2"
          />

          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-600/90 text-white border-none">
              #{sport.rank}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col gap-2">

          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{sport.sportName}</h3>
            <Badge className="bg-zinc-800 text-zinc-300 border-none">
              Efort {sport.effortLevel}/5
            </Badge>
          </div>

          <p className="text-sm text-zinc-400 line-clamp-2">
            {sport.description}
          </p>

          <div className="flex gap-2 mt-2 flex-wrap">
            {sport.isTeamSport && (
              <Badge variant="secondary">Echipă</Badge>
            )}
            {sport.isOutdoor && (
              <Badge variant="secondary">Outdoor</Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-zinc-400">
              Compatibilitate
            </span>
            <span className="text-blue-400 font-semibold">
              {sport.compatibilityScore} pts
            </span>
          </div>

        </CardContent>
      </Card>
    </Link>
  )
}