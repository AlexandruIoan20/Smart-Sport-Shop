// src/components/layout/Footer.tsx

import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Dumbbell className="w-6 h-6 text-blue-500" />
              SportHub
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Platformă dedicată sportivilor și pasionaților de fitness.
              Descoperă echipamente premium pentru orice activitate sportivă.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Navigare
            </h3>

            <div className="flex flex-col gap-2 text-zinc-400 text-sm">
              <Link to="/dashboard" className="hover:text-white">
                Dashboard
              </Link>

              <Link to="/sports" className="hover:text-white">
                Sporturi
              </Link>

              <Link to="/profile" className="hover:text-white">
                Profil
              </Link>

              <Link to="/login" className="hover:text-white">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 text-center text-zinc-500 text-sm">
          © 2026 SportHub. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}