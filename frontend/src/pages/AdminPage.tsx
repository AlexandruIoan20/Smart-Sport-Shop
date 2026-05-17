import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Package, ChevronUp, ChevronDown,
  Check, X, Boxes, Search,
} from "lucide-react";

const API = "http://localhost:8081/api/admin";

interface Category { categoryId: string; name: string; parentName: string | null; }
interface Sport { sportId: string; name: string; }

interface Product {
  productId: string;
  name: string;
  description:  string | null;
  price: number;
  categoryId: string;
  categoryName: string;
  sportId: string | null;
  sportName: string | null;
  targetLevel:  string;
  brand: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  stockQty: number;
}

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER:     "Începător",
  INTERMEDIATE: "Intermediar",
  ADVANCED:     "Avansat",
};

const LEVEL_COLOR: Record<string, string> = {
  BEGINNER: "text-emerald-400 bg-emerald-400/10",
  INTERMEDIATE: "text-amber-400 bg-amber-400/10",
  ADVANCED: "text-red-400 bg-red-400/10",
};

const emptyForm = () => ({
  name: "", description: "", price: "", categoryId: "",
  sportId: "", targetLevel: "BEGINNER", brand: "", imageUrl: "", stockQty: "0",
});

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full font-semibold">Stoc 0</span>;
  if (qty <= 5)  return <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-semibold">{qty} buc.</span>;
  return <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-semibold">{qty} buc.</span>;
}

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <span className="text-white font-semibold">{title}</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}


const cls = "w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600";
const label = (text: string, required = false) => (
  <label className="block text-xs text-zinc-400 mb-1">
    {text} {required && <span className="text-red-400">*</span>}
  </label>
);

function ProductForm({
  form, setForm, categories, sports,
}: {
  form: ReturnType<typeof emptyForm>;
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyForm>>>;
  categories: Category[];
  sports: Sport[];
}) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div>
        {label("Nume produs", true)}
        <input className={cls} value={form.name} onChange={set("name")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {label("Preț (RON)", true)}
          <input type="number" min={0} className={cls} value={form.price} onChange={set("price")} />
        </div>
        <div>
          {label("Stoc inițial")}
          <input type="number" min={0} className={cls} value={form.stockQty} onChange={set("stockQty")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {label("Categorie", true)}
          <select className={cls} value={form.categoryId} onChange={set("categoryId")}>
            <option value="">Selectează</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          {label("Sport")}
          <select className={cls} value={form.sportId} onChange={set("sportId")}>
            <option value="">Niciunul</option>
            {sports.map((s) => (
              <option key={s.sportId} value={s.sportId}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {label("Nivel")}
          <select className={cls} value={form.targetLevel} onChange={set("targetLevel")}>
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
        </div>
        <div>
          {label("Brand")}
          <input className={cls} value={form.brand} onChange={set("brand")} />
        </div>
      </div>

      <div>
        {label("URL imagine")}
        <input className={cls} value={form.imageUrl} onChange={set("imageUrl")} />
      </div>

      <div>
        {label("Descriere")}
        <textarea rows={3} className={`${cls} resize-none`} value={form.description} onChange={set("description")} />
      </div>
    </>
  );
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Product>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  const [showCreate,  setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stockEdit, setStockEdit] = useState<Product | null>(null);
  const [stockVal, setStockVal] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [createForm, setCreateForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());

  async function fetchAll() {
    setLoading(true);
    try {
        const [prodRes, catRes, sportRes] = await Promise.all([
          fetch(`${API}/products`),
          fetch(`${API}/categories`),
          fetch("http://localhost:8081/api/sports"),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const sportData = await sportRes.json();

        console.log({ catData }); 

        setProducts(Array.isArray(prodData) ? prodData : prodData.data || []);
        setCategories(Array.isArray(catData) ? catData : catData.data || []);
        setSports(Array.isArray(sportData) ? sportData : sportData.data || []);
    } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
        setCategories([]);
        setSports([]);
    } finally {
        setLoading(false);
    }
    }

  useEffect(() => { fetchAll(); }, []);

  async function handleCreate() {
    await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: createForm.name,
        description: createForm.description || null,
        price: parseFloat(createForm.price),
        categoryId: createForm.categoryId,
        sportId: createForm.sportId || null,
        targetLevel: createForm.targetLevel,
        brand: createForm.brand || null,
        imageUrl: createForm.imageUrl || null,
        stockQty: parseInt(createForm.stockQty) || 0,
      }),
    });
    setShowCreate(false);
    setCreateForm(emptyForm());
    fetchAll();
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      categoryId: p.categoryId,
      sportId: p.sportId ?? "",
      targetLevel: p.targetLevel,
      brand: p.brand ?? "",
      imageUrl: p.imageUrl ?? "",
      stockQty: String(p.stockQty),
    });
  }

  async function handleEdit() {
    if (!editProduct) return;
    await fetch(`${API}/products/${editProduct.productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || null,
        price: parseFloat(editForm.price),
        categoryId: editForm.categoryId,
        sportId: editForm.sportId || null,
        targetLevel: editForm.targetLevel,
        brand: editForm.brand || null,
        imageUrl: editForm.imageUrl || null,
        isActive: editProduct.isActive,
      }),
    });
    setEditProduct(null);
    fetchAll();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`${API}/products/${deleteTarget.productId}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchAll();
  }

  async function handleStockSave() {
    if (!stockEdit) return;
    await fetch(`${API}/products/${stockEdit.productId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: parseInt(stockVal) || 0 }),
    });
    setStockEdit(null);
    fetchAll();
  }

  function toggleSort(key: keyof Product) {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  function SortIcon({ k }: { k: keyof Product }) {
    if (sortKey !== k) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  }

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300 select-none whitespace-nowrap";

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin — Produse</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {products.length} produse totale · {products.filter(p => p.isActive).length} active
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Produs nou
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, brand, categorie..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Niciun produs găsit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort("name")}>Produs <SortIcon k="name" /></th>
                    <th className={thCls} onClick={() => toggleSort("categoryName")}>Categorie <SortIcon k="categoryName" /></th>
                    <th className={thCls} onClick={() => toggleSort("price")}>Preț <SortIcon k="price" /></th>
                    <th className={thCls} onClick={() => toggleSort("targetLevel")}>Nivel <SortIcon k="targetLevel" /></th>
                    <th className={thCls} onClick={() => toggleSort("stockQty")}>Stoc <SortIcon k="stockQty" /></th>
                    <th className={thCls} onClick={() => toggleSort("isActive")}>Status <SortIcon k="isActive" /></th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map((p) => (
                    <tr key={p.productId} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl ?? "https://placehold.co/48x48"}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />
                          <div>
                            <div className="text-white text-sm font-medium">{p.name}</div>
                            {p.brand && <div className="text-zinc-500 text-xs">{p.brand}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-zinc-400 text-sm">{p.categoryName}</td>

                      {/* Price */}
                      <td className="px-4 py-3 text-white text-sm font-semibold">
                        {Number(p.price).toFixed(2)} RON
                      </td>

                      {/* Level */}
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLOR[p.targetLevel] ?? "text-zinc-400 bg-zinc-800"}`}>
                          {LEVEL_LABEL[p.targetLevel] ?? p.targetLevel}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StockBadge qty={p.stockQty} />
                          <button
                            onClick={() => { setStockEdit(p); setStockVal(String(p.stockQty)); }}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors"
                            title="Modifică stoc"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {p.isActive
                          ? <span className="flex items-center gap-1 text-xs text-emerald-400"><Check className="w-3 h-3" /> Activ</span>
                          : <span className="flex items-center gap-1 text-xs text-zinc-500"><X className="w-3 h-3" /> Inactiv</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
                            title="Editează"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Dezactivează"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <Modal title="Produs nou" onClose={() => setShowCreate(false)}>
          <ProductForm form={createForm} setForm={setCreateForm} categories={categories} sports={sports} />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors">
              Anulează
            </button>
            <button onClick={handleCreate} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Creează
            </button>
          </div>
        </Modal>
      )}

      {/* ── Edit modal ── */}
      {editProduct && (
        <Modal title="Editează produs" onClose={() => setEditProduct(null)}>
          <ProductForm form={editForm} setForm={setEditForm} categories={categories} sports={sports} />
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={editProduct.isActive}
                onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                className="accent-blue-600"
              />
              Activ
            </label>
            <div className="flex-1" />
            <button onClick={() => setEditProduct(null)} className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors">
              Anulează
            </button>
            <button onClick={handleEdit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Salvează
            </button>
          </div>
        </Modal>
      )}

      {/* ── Stock modal ── */}
      {stockEdit && (
        <Modal title={`Stoc — ${stockEdit.name}`} onClose={() => setStockEdit(null)}>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cantitate nouă</label>
            <input
              type="number" min={0}
              value={stockVal}
              onChange={(e) => setStockVal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStockEdit(null)} className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors">
              Anulează
            </button>
            <button onClick={handleStockSave} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Actualizează
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <Modal title="Confirmare dezactivare" onClose={() => setDeleteTarget(null)}>
          <p className="text-zinc-300 text-sm">
            Ești sigur că vrei să dezactivezi produsul{" "}
            <span className="text-white font-semibold">{deleteTarget.name}</span>?
            Produsul nu va mai apărea în magazin dar istoricul comenzilor va fi păstrat.
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors">
              Anulează
            </button>
            <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
              Dezactivează
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}