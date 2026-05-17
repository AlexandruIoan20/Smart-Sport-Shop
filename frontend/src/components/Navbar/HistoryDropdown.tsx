import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { History, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useState(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-zinc-300 hover:text-white hover:bg-zinc-800"
        title="Istoric"
      >
        <History className="w-5 h-5" />
      </Button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-white font-semibold text-sm">Istoric</span>
          </div>

          {/* Options */}
          <div className="p-2 flex flex-col gap-1">
            <Link
              to="/order-history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600/30 transition-colors">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Istoric comenzi</div>
                <div className="text-zinc-500 text-xs">Toate comenzile tale</div>
              </div>
            </Link>

            <Link
              to="/recommendations-history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center shrink-0 group-hover:bg-amber-600/30 transition-colors">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Istoric recomandări</div>
                <div className="text-zinc-500 text-xs">Sesiuni anterioare</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}