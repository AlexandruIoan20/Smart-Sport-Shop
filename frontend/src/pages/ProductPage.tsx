// src/pages/ProductPage.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { Product } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ShoppingCart,
  Package,
  Trophy,
} from "lucide-react";

export default function ProductPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(
          `http://localhost:8081/api/products/${productId}`
        );

        const data = await response.json();

        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Se încarcă produsul...
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* IMAGE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <img
              src={
                product.imageUrl ??
                "https://placehold.co/800x800/27272a/ffffff?text=No+Image"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* INFO */}
          <div className="flex flex-col gap-6">

            <div className="flex items-center gap-3 flex-wrap">
              {product.brand && (
                <Badge className="bg-zinc-800 text-zinc-300">
                  {product.brand}
                </Badge>
              )}

              <Badge className="bg-blue-600">
                {product.targetLevel}
              </Badge>

              {isOutOfStock ? (
                <Badge variant="destructive">
                  Stoc epuizat
                </Badge>
              ) : (
                <Badge className="bg-green-600">
                  În stoc
                </Badge>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              <p className="text-zinc-400 mt-4 text-lg">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 text-zinc-300">
              
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>
                  Categorie: {product.categoryName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>
                  Sport: {product.sportName}
                </span>
              </div>

              <div>
                Stoc disponibil:{" "}
                <span className="font-bold text-white">
                  {product.stockQuantity}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              
              <div className="text-5xl font-bold mb-6">
                {product.price}
                <span className="text-2xl text-zinc-400 ml-2">
                  RON
                </span>
              </div>

              <Button
                disabled={isOutOfStock}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />

                Adaugă în comandă
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}