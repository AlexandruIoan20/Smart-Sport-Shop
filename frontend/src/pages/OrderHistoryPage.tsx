import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CircleDot,
} from "lucide-react";

const USER_ID = localStorage.getItem("userId") ?? "";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string | null;
}

interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string | null;
  itemCount: number;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  PENDING:   { label: "În așteptare", color: "text-amber-400",  bg: "bg-amber-400/10",  Icon: Clock        },
  CONFIRMED: { label: "Confirmată",   color: "text-blue-400",   bg: "bg-blue-400/10",   Icon: CheckCircle2 },
  SHIPPED:   { label: "Expediată",    color: "text-violet-400", bg: "bg-violet-400/10", Icon: Truck        },
  DELIVERED: { label: "Livrată",      color: "text-emerald-400",bg: "bg-emerald-400/10",Icon: CheckCircle2 },
  CANCELLED: { label: "Anulată",      color: "text-red-400",    bg: "bg-red-400/10",    Icon: XCircle      },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    Icon: CircleDot,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}
    >
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(order.createdAt).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const time = new Date(order.createdAt).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-700">
      {/* Card header */}
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-4"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-zinc-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-mono text-xs text-zinc-500">
              #{order.orderId.split("-")[0].toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-zinc-400 text-xs mt-0.5">
            {date} · {time} · {order.itemCount}{" "}
            {order.itemCount === 1 ? "produs" : "produse"}
          </div>
        </div>

        {/* Total + chevron */}
        <div className="text-right flex-shrink-0">
          <div className="text-white font-bold">
            {Number(order.totalAmount).toFixed(2)} RON
          </div>
          <div className="flex justify-end mt-1 text-zinc-600">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-zinc-800">
          {/* Items list */}
          <div className="divide-y divide-zinc-800/60">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 px-5 py-3"
              >
                <img
                  src={item.imageUrl ?? "https://placehold.co/80x80"}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {item.productName}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    x{item.quantity} · {Number(item.unitPrice).toFixed(2)} RON / buc.
                  </div>
                </div>
                <div className="text-blue-400 text-sm font-semibold flex-shrink-0">
                  {(item.quantity * Number(item.unitPrice)).toFixed(2)} RON
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-zinc-950/40 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-zinc-500 text-xs">
              <span className="text-zinc-400 font-medium">Livrare la: </span>
              {order.shippingAddress}
            </div>
            <div className="text-zinc-400 text-xs font-medium">
              Total:{" "}
              <span className="text-white font-bold">
                {Number(order.totalAmount).toFixed(2)} RON
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8081/api/orders/history/${USER_ID}`
        );

        if (res.status === 204) {
          setOrders([]);
          return;
        }

        if (!res.ok) {
          setError(true);
          return;
        }

        const data: Order[] = await res.json();
        setOrders(data);
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
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Istoric comenzi</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Toate comenzile tale, în ordine cronologică.
          </p>
        </div>

        {/* States */}
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

        {!loading && error && (
          <div className="bg-zinc-900 border border-red-900/50 rounded-2xl p-8 text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-zinc-300 font-medium">Eroare la încărcare</p>
            <p className="text-zinc-500 text-sm mt-1">
              Nu s-au putut prelua comenzile.
            </p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Package className="w-8 h-8 text-zinc-600" />
            </div>
            <div>
              <p className="text-white font-semibold">Nicio comandă încă</p>
              <p className="text-zinc-500 text-sm mt-1">
                Comenzile tale vor apărea aici după ce plasezi prima comandă.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Explorează produse
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}