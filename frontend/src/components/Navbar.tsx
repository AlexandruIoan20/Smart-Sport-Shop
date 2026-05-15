// src/components/layout/Navbar.tsx

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Search, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CartDropdown from "./CartDropdown";
import type { Product } from "@/types";

export default function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (search.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:8081/api/products/search?name=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        setResults(data.slice(0, 5));
        setShowDropdown(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(fetchProducts, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  function handleSelectProduct(productId: string) {
    setSearch("");
    setShowDropdown(false);

    navigate(`/products/${productId}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* LOGO */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-white font-bold text-xl"
        >
          <Dumbbell className="w-6 h-6 text-blue-500" />
          <span>SportHub</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>

          <Link
            to="/sports"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Trophy className="w-4 h-4" />
            Sporturi
          </Link>
        </nav>

        {/* SEARCH */}
        <div ref={searchRef} className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (results.length > 0) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Caută produse..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-600"
            />
          </div>

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="absolute top-12 w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              {loading && (
                <div className="p-4 text-zinc-400 text-sm">Se caută...</div>
              )}

              {!loading && results.length === 0 && search.length >= 2 && (
                <div className="p-4 text-zinc-400 text-sm">
                  Nu există produse.
                </div>
              )}

              {!loading &&
                results.map((product) => (
                  <button
                    key={product.productId}
                    onClick={() => handleSelectProduct(product.productId)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <img
                      src={product.imageUrl ?? "https://placehold.co/100x100"}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />

                    <div className="flex-1 overflow-hidden">
                      <div className="text-white font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-zinc-400 text-sm truncate">
                        {product.brand}
                      </div>
                    </div>

                    <div className="text-blue-400 font-semibold">
                      {product.price} RON
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* CART DROPDOWN — componentă separată */}
          <CartDropdown />

          <Link to="/profile">
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <User className="w-4 h-4 mr-2" />
              Profil
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
