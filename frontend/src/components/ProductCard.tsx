import type { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <Card className="min-w-65 max-w-65 bg-zinc-900 border-zinc-800 text-zinc-100 flex flex-col overflow-hidden snap-start hover:ring-1 hover:ring-zinc-600 transition-all duration-300">
      <div className="relative h-48 w-full bg-zinc-800">
        <img 
          src={product.imageUrl ?? "https://placehold.co/500x500/27272a/ffffff?text=Fara+Imagine"} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {/* Badge-uri deasupra imaginii */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.brand && (
            <Badge variant="secondary" className="bg-zinc-950/70 text-zinc-300 border-none backdrop-blur-sm">
              {product.brand}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <Badge variant="destructive">Stoc Epuizat</Badge>
          ) : (
            <Badge className="bg-green-600/90 hover:bg-green-600 text-white border-none">
              În Stoc
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col grow justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500 font-medium uppercase mb-1">
            {product.sportName} • {product.targetLevel}
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          <p className="text-zinc-400 text-sm mt-2 line-clamp-2" title={product.description || ""}>
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-white">
            {product.price} <span className="text-sm font-normal text-zinc-400">RON</span>
          </span>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isOutOfStock}
          >
            Adaugă
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}