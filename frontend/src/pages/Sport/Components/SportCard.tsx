import type { Sport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SportCard({ sport }: { sport: Sport }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 overflow-hidden hover:ring-1 hover:ring-zinc-600 transition-all duration-300">

      {/* Imagine */}
        <div className="h-40 w-full bg-zinc-800 flex items-center justify-center">
        <img
            src={sport.imageUrl ?? "https://placehold.co/500x500/27272a/ffffff?text=Sport"}
            alt={sport.name}
            className="w-full h-full object-contain p-2"
        />
        </div>

      <CardContent className="p-4 flex flex-col gap-2">
        
        {/* Badges */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{sport.name}</h3>

          <Badge className="bg-zinc-800 text-zinc-300 border-none">
            Nivel {sport.effortLevel}/5
          </Badge>
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2">
          {sport.description}
        </p>

        {/* Info extra */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {sport.teamSport && (
            <Badge variant="secondary">Team</Badge>
          )}
          {sport.outdoor && (
            <Badge variant="secondary">Outdoor</Badge>
          )}
        </div>

        <div className="text-sm text-zinc-400 mt-2">
          Buget minim: <span className="text-white font-medium">{sport.minBudget} RON</span>
        </div>

      </CardContent>
    </Card>
  );
}