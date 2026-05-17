import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, OrderCart } from "@/types";

const USER_ID = localStorage.getItem("userId") || "default-user-id";

export default function CartDropdown() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<OrderCart | null>(null);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    async function fetchCart() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8081/api/orders/pending/${USER_ID}`);

        if (res.status === 204) {
          setCart(null);
          return;
        }

        const data: OrderCart = await res.json();
        setCart({
            ...data,
            items: data.items ?? [],
        });
      } catch (err) {
        console.error(err);
        setCart(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [open]);

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantityInCart, 0) ?? 0;

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-zinc-300 hover:text-white hover:bg-zinc-800"
      >
        <ShoppingCart className="w-5 h-5" />

        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          
          {/* HEADER */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Coșul meu</span>
            {cart && (
              <span className="text-zinc-500 text-xs">
                {totalItems} {totalItems === 1 ? "produs" : "produse"}
              </span>
            )}
          </div>

          {/* BODY */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-6 text-center text-zinc-400 text-sm">
                Se încarcă...
              </div>
            )}

            {!loading && !cart && (
              <div className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Package className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm">Nu ai niciun produs în coș.</p>
              </div>
            )}

            {!loading && cart?.items.map((item: CartItem) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0"
              >
                <img
                  src={item.imageUrl ?? "https://placehold.co/100x100"}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />

                <div className="flex-1 overflow-hidden">
                  <div className="text-white text-sm font-medium truncate">
                    {item.productName}
                  </div>
                  <div className="text-zinc-500 text-xs truncate">{item.brand}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-400 text-xs">x{item.quantityInCart}</span>
                    <span className="text-blue-400 text-xs font-semibold">
                      {(item.unitPrice * item.quantityInCart).toFixed(2)} RON
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          {cart && (
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="text-white font-bold">
                  {(Number(cart.totalAmount) || 0).toFixed(2)} RON
                </span>
              </div>

              <Link to="/order" onClick={() => setOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
                  Vezi comanda
                </Button>
              </Link>
            </div>
          )}

          {!loading && !cart && (
            <div className="px-4 py-3 border-t border-zinc-800">
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white text-sm"
                >
                  Explorează produse
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
