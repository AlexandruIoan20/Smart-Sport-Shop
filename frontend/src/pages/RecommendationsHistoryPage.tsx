import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trophy,
  Package,
  Star,
  Zap,
  Users,
  Sun,
} from "lucide-react";

const USER_ID = localStorage.getItem("userId") ?? "";
const API = "http://localhost:8081";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecommendationSport {
  sportId: string;
  sportName: string;
  sportDescription: string | null;
  imageUrl: string | null;
  isTeamSport: boolean;
  isOutdoor: boolean;
  effortLevel: number;
  compatibilityScore: number;
  rank: number;
}

interface RecommendationProduct {
  productId: string;
  productName: string;
  imageUrl: string | null;
  price: number;
  brand: string | null;
  reason: string | null;
  sportId: string;
  sportName: string;
}

interface RecommendationSession {
  sessionId: string;
  createdAt: string;
  userLevelAtTime: string;
  sports: RecommendationSport[];
  products: RecommendationProduct[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  BEGINNER:     { label: "Începător",    color: "text-emerald-400", bg: "bg-emerald-400/10" },
  INTERMEDIATE: { label: "Intermediar", color: "text-amber-400",   bg: "bg-amber-400/10"   },
  ADVANCED:     { label: "Avansat",     color: "text-red-400",     bg: "bg-red-400/10"     },
};

function LevelBadge({ level }: { level: string }) {
  const cfg = LEVEL_CONFIG[level] ?? { label: level, color: "text-zinc-400", bg: "bg-zinc-800" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <Star className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CompatibilityBar({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    pct >= 75 ? "bg-emerald-500" :
    pct >= 50 ? "bg-blue-500" :
    pct >= 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 font-mono w-10 text-right">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function EffortDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level ? "bg-blue-400" : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: RecommendationSession }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"sports" | "products">("sports");

  const date = new Date(session.createdAt).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const time = new Date(session.createdAt).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const topSport = session.sports[0];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Header */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">
              {topSport ? topSport.sportName : "Sesiune recomandări"}
            </span>
            {session.sports.length > 1 && (
              <span className="text-zinc-500 text-xs">
                +{session.sports.length - 1} sporturi
              </span>
            )}
            <LevelBadge level={session.userLevelAtTime} />
          </div>
          <div className="text-zinc-500 text-xs mt-0.5">
            {date} · {time} · {session.sports.length} sporturi · {session.products.length} produse
          </div>
        </div>

        {/* Chevron */}
        <div className="text-zinc-600 flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-800">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("sports")}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "sports"
                  ? "text-white border-b-2 border-blue-500 -mb-px"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Sporturi ({session.sports.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "products"
                  ? "text-white border-b-2 border-blue-500 -mb-px"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Produse ({session.products.length})
            </button>
          </div>

          {/* Sports tab */}
          {activeTab === "sports" && (
            <div className="divide-y divide-zinc-800/60">
              {session.sports.map((sport) => (
                <div key={sport.sportId} className="px-5 py-3.5 flex items-start gap-4">
                  {/* Rank badge */}
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-400 mt-0.5">
                    {sport.rank}
                  </div>

                  {/* Sport image */}
                  {sport.imageUrl ? (
                    <img
                      src={sport.imageUrl}
                      alt={sport.sportName}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-zinc-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">{sport.sportName}</span>
                      <div className="flex gap-1">
                        {sport.isTeamSport && (
                          <span className="flex items-center gap-0.5 text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                            <Users className="w-2.5 h-2.5" /> Echipă
                          </span>
                        )}
                        {sport.isOutdoor && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                            <Sun className="w-2.5 h-2.5" /> Outdoor
                          </span>
                        )}
                      </div>
                    </div>

                    {sport.sportDescription && (
                      <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">
                        {sport.sportDescription}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-zinc-600 mb-1">Compatibilitate</div>
                        <CompatibilityBar score={sport.compatibilityScore} />
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-600 mb-1">Efort</div>
                        <EffortDots level={sport.effortLevel} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products tab */}
          {activeTab === "products" && (
            <div className="divide-y divide-zinc-800/60">
              {session.products.length === 0 ? (
                <div className="px-5 py-6 text-center text-zinc-500 text-sm">
                  Niciun produs recomandat în această sesiune.
                </div>
              ) : (
                session.products.map((product) => (
                  <div key={product.productId} className="px-5 py-3 flex items-center gap-3">
                    <img
                      src={product.imageUrl ?? "https://placehold.co/80x80"}
                      alt={product.productName}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-zinc-800"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {product.productName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {product.brand && (
                          <span className="text-zinc-500 text-xs">{product.brand}</span>
                        )}
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                          {product.sportName}
                        </span>
                      </div>
                      {product.reason && (
                        <div className="flex items-start gap-1 mt-1">
                          <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-zinc-400 text-xs">{product.reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-blue-400 font-bold text-sm flex-shrink-0">
                      {Number(product.price).toFixed(2)} RON
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendationHistoryPage() {
  const [sessions, setSessions] = useState<RecommendationSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(
          `${API}/api/recommendations/history/${USER_ID}`
        );

        if (res.status === 204) { setSessions([]); return; }
        if (!res.ok)            { setError(true);  return; }

        const data: RecommendationSession[] = await res.json();
        setSessions(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (USER_ID) fetchHistory();
    else setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Istoric recomandări</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Toate sesiunile AI generate pe baza profilului tău.
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-zinc-900 border border-red-900/50 rounded-2xl p-8 text-center">
            <Sparkles className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-zinc-300 font-medium">Eroare la încărcare</p>
            <p className="text-zinc-500 text-sm mt-1">
              Nu s-au putut prelua sesiunile de recomandări.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sessions.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Nicio sesiune încă</p>
              <p className="text-zinc-500 text-sm mt-1">
                Completează-ți profilul și generează prima recomandare.
              </p>
            </div>
            <Link
              to="/profile"
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Completează profilul
            </Link>
          </div>
        )}

        {/* Sessions */}
        {!loading && !error && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}