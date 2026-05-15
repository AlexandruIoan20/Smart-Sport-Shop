import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

type Sport = {
  sportId:     string;
  name:        string;
  description: string;
  effortLevel: number;
  minBudget:   number;
  imageUrl:    string | null;
  teamSport:   boolean;
  outdoor:     boolean;
  active:      boolean;
};

export default function SportProductsPage() {
  const { sportId } = useParams<{ sportId: string }>();

  const [sport,              setSport]              = useState<Sport | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState<string | null>(null);

  useEffect(() => {
    if (!sportId) return;
    loadPage();
  }, [sportId]);

  async function loadPage() {
    try {
      setLoading(true);
      setError(null);

      const [sportRes, productsRes] = await Promise.all([
        fetch(`http://localhost:8081/api/sports/${sportId}`),
        fetch(`http://localhost:8081/api/products/sport/${sportId}`),
      ]);

      if (!sportRes.ok)    throw new Error("Sportul nu a fost găsit.");
      if (!productsRes.ok) throw new Error("Nu s-au putut încărca produsele.");

      const sportData: Sport    = await sportRes.json();
      const products:  Product[] = await productsRes.json();

      setSport(sportData);

      // Grupam direct dupa categoryName — fara nevoie de categoryId
      const mapped: Record<string, Product[]> = {};
      products.forEach(p => {
        const key = p.categoryName ?? "Altele";
        if (!mapped[key]) mapped[key] = [];
        mapped[key].push(p);
      });

      setProductsByCategory(mapped);

    } catch (err: any) {
      setError(err.message ?? "Eroare necunoscută.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="animate-pulse text-zinc-400">Se încarcă produsele...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <p className="text-red-400">{error}</p>
        <Link to="/sports" className="text-blue-400 underline mt-4 block">
          ← Înapoi la sporturi
        </Link>
      </main>
    );
  }

  const categoryNames = Object.keys(productsByCategory);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">

      <div className="mb-10">
        <Link
          to="/sports"
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          ← Înapoi la sporturi
        </Link>

        <div className="flex items-center gap-4 mt-4">
          {sport?.imageUrl && (
            <img
              src={sport.imageUrl}
              alt={sport.name}
              className="w-16 h-16 object-contain rounded-lg bg-zinc-800 p-2"
            />
          )}
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {sport?.name}
            </h1>
            <p className="text-zinc-400 mt-1">
              {sport?.description}
            </p>
          </div>
        </div>
      </div>

      {categoryNames.length === 0 ? (
        <div className="text-zinc-400">
          Nu există produse disponibile pentru acest sport momentan.
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {categoryNames.map(categoryName => (
            <section key={categoryName}>

              <h2 className="text-2xl font-bold mb-4 text-zinc-100">
                {categoryName}
              </h2>

              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {productsByCategory[categoryName].map(product => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>

            </section>
          ))}
        </div>
      )}

    </main>
  );
}