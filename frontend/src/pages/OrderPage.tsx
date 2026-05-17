import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { CartItem, OrderCart } from "@/types";

import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  MapPin,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  Check,
  X,
} from "lucide-react";

const USER_ID = localStorage.getItem("userId") || "default-user-id";

type ItemActionState = "idle" | "loading";
type OrderActionState = "idle" | "loading" | "success" | "error";

export default function OrderPage() {
  const [cart, setCart] = useState<OrderCart | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [itemStates, setItemStates] = useState<Record<string, ItemActionState>>({});

  const [confirmState, setConfirmState] = useState<OrderActionState>("idle");
  const [cancelState, setCancelState] = useState<OrderActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      setPageLoading(true);
      const res = await fetch(`http://localhost:8081/api/orders/pending/${USER_ID}`);

      if (res.status === 204) {
        setCart(null);
        return;
      }

      const data: OrderCart = await res.json();
      setCart({ ...data, items: data.items ?? [] });
    } catch (err) {
      console.error(err);
      setCart(null);
    } finally {
      setPageLoading(false);
    }
  }

  function setItemLoading(productId: string, state: ItemActionState) {
    setItemStates((prev) => ({ ...prev, [productId]: state }));
  }

  async function handleUpdateQuantity(productId: string, newQuantity: number) {
    if (!cart) return;
    if (newQuantity < 1) return;

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;
    if (newQuantity > item.stockAvailable) return;

    try {
      setItemLoading(productId, "loading");

      const res = await fetch(
        `http://localhost:8081/api/orders/${cart.orderId}/items/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!res.ok) throw new Error("Eroare la actualizare");

      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((i) =>
          i.productId === productId ? { ...i, quantityInCart: newQuantity } : i
        );
        const newTotal = updatedItems.reduce(
          (sum, i) => sum + i.unitPrice * i.quantityInCart,
          0
        );
        return { ...prev, items: updatedItems, totalAmount: newTotal };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setItemLoading(productId, "idle");
    }
  }

  async function handleRemoveItem(productId: string) {
    if (!cart) return;

    try {
      setItemLoading(productId, "loading");

      const res = await fetch(
        `http://localhost:8081/api/orders/${cart.orderId}/items/${productId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Eroare la ștergere");

      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.filter((i) => i.productId !== productId);
        const newTotal = updatedItems.reduce(
          (sum, i) => sum + i.unitPrice * i.quantityInCart,
          0
        );
        return { ...prev, items: updatedItems, totalAmount: newTotal };
      });
    } catch (err) {
      console.error(err);
      setItemLoading(productId, "idle");
    }
  }

  async function handleConfirmOrder() {
    if (!cart) return;

    try {
      setConfirmState("loading");
      setActionError(null);

      const res = await fetch(
        `http://localhost:8081/api/orders/${cart.orderId}/confirm/${USER_ID}`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Stoc insuficient sau comanda nu poate fi confirmată.");
      }

      setConfirmState("success");
      setCart((prev) => (prev ? { ...prev, orderStatus: "CONFIRMED" } : prev));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Eroare necunoscută.");
      setConfirmState("error");
      setTimeout(() => {
        setConfirmState("idle");
        setActionError(null);
      }, 4000);
    }
  }

  async function handleCancelOrder() {
    if (!cart) return;
    setShowCancelModal(false);

    try {
      setCancelState("loading");
      setActionError(null);

      const res = await fetch(
        `http://localhost:8081/api/orders/${cart.orderId}/cancel/${USER_ID}`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Comanda nu poate fi anulată.");
      }

      setCancelState("success");
      setCart((prev) => (prev ? { ...prev, orderStatus: "CANCELLED" } : prev));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Eroare necunoscută.");
      setCancelState("error");
      setTimeout(() => {
        setCancelState("idle");
        setActionError(null);
      }, 4000);
    }
  }

  const totalItems = cart?.items.reduce((sum, i) => sum + i.quantityInCart, 0) ?? 0;

  const isOrderConfirmed = cart?.orderStatus === "CONFIRMED";
  const isOrderCancelled = cart?.orderStatus === "CANCELLED";
  const isOrderEditable = !isOrderConfirmed && !isOrderCancelled;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm">Se încarcă comanda...</span>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-zinc-500" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Comanda ta e goală</h2>
          <p className="text-zinc-400 text-sm">
            Adaugă produse din catalog pentru a începe o comandă.
          </p>
        </div>

        <Link to="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6">
            Explorează produse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>

            <h3 className="text-white font-bold text-lg mb-2">Anulezi comanda?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Această acțiune nu poate fi revenită. Comanda va fi marcată ca{" "}
              <span className="text-red-400 font-medium">CANCELLED</span>.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
              >
                Înapoi
              </Button>
              <Button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white"
              >
                Da, anulează
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </Link>

          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">Comanda mea</h1>
              <p className="text-zinc-400 text-sm mt-1">
                {totalItems} {totalItems === 1 ? "produs" : "produse"}
              </p>
            </div>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                isOrderConfirmed
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : isOrderCancelled
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {cart.orderStatus}
            </span>
          </div>
        </div>

        {/* STATUS BANNERS */}
        {isOrderConfirmed && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-green-300 text-sm">
              Comanda a fost confirmată cu succes. Vei fi contactat în curând.
            </p>
          </div>
        )}

        {isOrderCancelled && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">Această comandă a fost anulată.</p>
          </div>
        )}

        {/* ERROR BANNER */}
        {actionError && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{actionError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ITEMS LIST */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {cart.items.map((item: CartItem) => {
              const isItemLoading = itemStates[item.productId] === "loading";
              const atMin = item.quantityInCart <= 1;
              const atMax = item.quantityInCart >= item.stockAvailable;

              return (
                <div
                  key={item.productId}
                  className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 transition-opacity duration-200 ${
                    isItemLoading ? "opacity-50 pointer-events-none" : ""
                  } ${!isOrderEditable ? "opacity-70" : ""}`}
                >
                  <Link to={`/products/${item.productId}`}>
                    <img
                      src={item.imageUrl ?? "https://placehold.co/100x100/27272a/ffffff"}
                      alt={item.productName}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 hover:scale-105 transition-transform"
                    />
                  </Link>

                  <div className="flex-1 overflow-hidden">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-white font-semibold hover:text-blue-400 transition-colors truncate block"
                    >
                      {item.productName}
                    </Link>
                    <div className="text-zinc-500 text-sm mt-0.5">{item.brand}</div>
                    <div className="text-zinc-400 text-xs mt-1">
                      {item.unitPrice.toFixed(2)} RON / buc
                    </div>
                  </div>

                  {/* QUANTITY — editabil doar când PENDING */}
                  {isOrderEditable ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantityInCart - 1)
                        }
                        disabled={atMin || isItemLoading}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-8 text-center text-white font-bold text-sm">
                        {item.quantityInCart}
                      </span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantityInCart + 1)
                        }
                        disabled={atMax || isItemLoading}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 text-center text-zinc-400 font-bold text-sm shrink-0">
                      ×{item.quantityInCart}
                    </div>
                  )}

                  <div className="text-blue-400 font-bold text-sm w-20 text-right shrink-0">
                    {(item.unitPrice * item.quantityInCart).toFixed(2)} RON
                  </div>

                  {/* DELETE — vizibil doar când PENDING */}
                  {isOrderEditable && (
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isItemLoading}
                      className="w-8 h-8 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isItemLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold text-lg mb-5">Sumar comandă</h2>

              {cart.shippingAddress && (
                <div className="flex items-start gap-2 mb-5 pb-5 border-b border-zinc-800">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-zinc-400 text-xs mb-1">Adresă de livrare</div>
                    <div className="text-white text-sm">{cart.shippingAddress}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mb-5">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-400 truncate pr-2 flex-1">
                      {item.productName}{" "}
                      <span className="text-zinc-600">×{item.quantityInCart}</span>
                    </span>
                    <span className="text-zinc-300 shrink-0">
                      {(item.unitPrice * item.quantityInCart).toFixed(2)} RON
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total</span>
                  <span className="text-white text-2xl font-bold">
                    {cart.totalAmount.toFixed(2)}
                    <span className="text-zinc-500 text-sm ml-1">RON</span>
                  </span>
                </div>
              </div>

              {/* ACTIONS — doar când PENDING */}
              {isOrderEditable && (
                <>
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={
                      confirmState === "loading" || confirmState === "success"
                    }
                    className={`w-full h-11 font-semibold transition-all duration-300 ${
                      confirmState === "success"
                        ? "bg-green-600 hover:bg-green-600 cursor-default"
                        : "bg-blue-600 hover:bg-blue-500"
                    } text-white`}
                  >
                    {confirmState === "loading" && (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se procesează...
                      </>
                    )}
                    {confirmState === "success" && (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Comandă confirmată!
                      </>
                    )}
                    {(confirmState === "idle" || confirmState === "error") && (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Plasează comanda
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelState === "loading"}
                    variant="ghost"
                    className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 text-sm"
                  >
                    {cancelState === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Se anulează...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Anulează comanda
                      </>
                    )}
                  </Button>
                </>
              )}

              {isOrderConfirmed && (
                <div className="flex items-center justify-center gap-2 py-3 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Comandă confirmată
                </div>
              )}

              {isOrderCancelled && (
                <div className="flex items-center justify-center gap-2 py-3 text-red-400 text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  Comandă anulată
                </div>
              )}

              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm"
                >
                  Continuă cumpărăturile
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}