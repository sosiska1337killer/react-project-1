import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "./hooks/useDebounce";

/* ---------- Данные ---------- */
const PRODUCTS = [
  { id: 1, name: "MacBook Air 13", category: "Ноутбуки", price: 549000, inStock: true },
  { id: 2, name: "Lenovo ThinkPad E14", category: "Ноутбуки", price: 389000, inStock: false },
  { id: 3, name: "iPhone 15", category: "Телефоны", price: 419000, inStock: true },
  { id: 4, name: "Samsung Galaxy S24", category: "Телефоны", price: 359000, inStock: true },
  { id: 5, name: "Dell UltraSharp 27", category: "Мониторы", price: 249000, inStock: true },
  { id: 6, name: "LG 24 IPS", category: "Мониторы", price: 89000, inStock: false },
  { id: 7, name: "Logitech MX Master 3S", category: "Аксессуары", price: 49000, inStock: true },
  { id: 8, name: "Клавиатура Keychron K2", category: "Аксессуары", price: 62000, inStock: true },
  { id: 9, name: "AirPods Pro 2", category: "Аксессуары", price: 119000, inStock: false },
];

const CATEGORIES = ["Все", "Ноутбуки", "Телефоны", "Мониторы", "Аксессуары"];

/* ---------- Имитация серверного поиска (по названию И категории) ---------- */
function fetchMockResults(query) {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
}

const formatPrice = (n) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);

/* ---------- Компонент ---------- */
export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [sort, setSort] = useState("default");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ввод мгновенный, а запрос стартует только после паузы 500 мс
  const debouncedSearch = useDebounce(search, 500);

  // Сетевой слой: симуляция API 600 мс + защита от Race Condition
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const timerId = setTimeout(() => {
      if (!isCancelled) {
        console.log("API request:", debouncedSearch);
        setProducts(fetchMockResults(debouncedSearch));
        setIsLoading(false);
      }
    }, 600);

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };
  }, [debouncedSearch]);

  // Фильтр по категории + сортировка по цене
  const visibleProducts = useMemo(() => {
    const filtered =
      category === "Все" ? products : products.filter((p) => p.category === category);

    const copy = [...filtered];
    if (sort === "asc") copy.sort((a, b) => a.price - b.price);
    if (sort === "desc") copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [products, category, sort]);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Mini Shop 2.0</h1>

      <input
        style={styles.input}
        type="text"
        placeholder="Поиск по названию или категории..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={styles.tabs}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{ ...styles.tab, ...(c === category ? styles.tabActive : {}) }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={styles.toolbar}>
        <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">По умолчанию</option>
          <option value="asc">Сначала недорогие (↑)</option>
          <option value="desc">Сначала дорогие (↓)</option>
        </select>

        {!isLoading && (
          <span style={styles.badge}>Найдено товаров: {visibleProducts.length}</span>
        )}
      </div>

      {isLoading ? (
        <div style={styles.loading}>Ищем товары на сервере...</div>
      ) : visibleProducts.length === 0 ? (
        <div style={styles.empty}>Ничего не найдено</div>
      ) : (
        <div style={styles.grid}>
          {visibleProducts.map((product) => (
            <div key={product.id} style={styles.card}>
              <div style={styles.category}>{product.category}</div>
              <h3 style={styles.name}>{product.name}</h3>
              <div style={styles.price}>{formatPrice(product.price)}</div>
              <span
                style={{
                  ...styles.stock,
                  background: product.inStock ? "#14532d" : "#7f1d1d",
                  color: product.inStock ? "#86efac" : "#fca5a5",
                }}
              >
                {product.inStock ? "В наличии" : "Нет в наличии"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Стили (тёмная тема, чёрный фон) ---------- */
const styles = {
  page: { maxWidth: 900, margin: "0 auto", padding: 24 },
  title: { margin: "0 0 16px", color: "#fff" },
  input: {
    width: "100%", padding: "12px 14px", fontSize: 16,
    background: "#111", color: "#fff", border: "1px solid #333", borderRadius: 8,
  },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" },
  tab: {
    padding: "8px 14px", border: "1px solid #333", borderRadius: 999,
    background: "#111", color: "#d1d5db", cursor: "pointer", fontSize: 14,
  },
  tabActive: { background: "#6366f1", color: "#fff", borderColor: "#6366f1" },
  toolbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, marginBottom: 16, flexWrap: "wrap",
  },
  select: {
    padding: "8px 10px", fontSize: 14, borderRadius: 8,
    background: "#111", color: "#fff", border: "1px solid #333",
  },
  badge: {
    background: "#1e1b4b", color: "#a5b4fc", padding: "6px 12px",
    borderRadius: 999, fontSize: 14,
  },
  loading: {
    padding: 24, textAlign: "center", background: "#422006",
    color: "#fde68a", borderRadius: 8,
  },
  empty: { padding: 24, textAlign: "center", color: "#9ca3af" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 },
  card: { border: "1px solid #262626", borderRadius: 12, padding: 16, background: "#0d0d0d" },
  category: { fontSize: 13, color: "#9ca3af" },
  name: { margin: "6px 0 10px", fontSize: 18, color: "#fff" },
  price: { fontSize: 20, fontWeight: 600, marginBottom: 10, color: "#fff" },
  stock: { display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 13, fontWeight: 500 },
};
