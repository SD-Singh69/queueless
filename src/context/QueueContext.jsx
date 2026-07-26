/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
const QueueContext = createContext();
export const useQueue = () => useContext(QueueContext);
const seed = [
  {
    id: "careplus",
    name: "CarePlus Pharmacy",
    category: "Medical store",
    address: "Indiranagar, Bengaluru",
    wait: 12,
    active: 4,
    service: 4,
    isOpen: true,
    ownerId: "demo-owner",
  },
  {
    id: "greenbasket",
    name: "GreenBasket Market",
    category: "Grocery",
    address: "Koramangala, Bengaluru",
    wait: 18,
    active: 7,
    service: 3,
    isOpen: true,
  },
  {
    id: "trim",
    name: "Trim & Co.",
    category: "Salon",
    address: "HSR Layout, Bengaluru",
    wait: 24,
    active: 5,
    service: 6,
    isOpen: true,
  },
];
export function QueueProvider({ children }) {
  const [shops, setShops] = useState(
    () => JSON.parse(localStorage.getItem("ql_shops")) || seed,
  );
  const [entries, setEntries] = useState(
    () => JSON.parse(localStorage.getItem("ql_entries")) || [],
  );
  useEffect(
    () => localStorage.setItem("ql_shops", JSON.stringify(shops)),
    [shops],
  );
  useEffect(() => {
    const sync = (event) => {
      if (event.key === "ql_shops") setShops(JSON.parse(event.newValue || "[]"));
      if (event.key === "ql_entries") setEntries(JSON.parse(event.newValue || "[]"));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(
    () => localStorage.setItem("ql_entries", JSON.stringify(entries)),
    [entries],
  );
  const join = (shop, user) => {
    if (
      entries.some(
        (e) =>
          e.shopId === shop.id &&
          e.userId === user.id &&
          e.status === "waiting",
      )
    )
      throw new Error("You are already in this queue.");
    const existing = entries.filter((e) => e.shopId === shop.id);
    const token = Math.max(0, ...existing.map((e) => e.token)) + 1;
    const before = existing.filter((e) => e.status === "waiting").length;
    const entry = {
      id: crypto.randomUUID(),
      shopId: shop.id,
      userId: user.id,
      customer: user.name,
      token,
      status: "waiting",
      createdAt: new Date().toISOString(),
      estimatedWait: before * shop.service,
    };
    setEntries((x) => [entry, ...x]);
    return entry;
  };
  const advance = (id, status) =>
    setEntries((x) => x.map((e) => (e.id === id ? { ...e, status } : e)));
  const addShop = (details, user) => {
    const shop = {
      ...details,
      id: crypto.randomUUID(),
      ownerId: user.id,
      active: 0,
      wait: 0,
      isOpen: true,
      service: Number(details.service) || 5,
    };
    setShops((x) => [shop, ...x]);
    return shop;
  };
  const updateShop = (id, updates) => setShops((all) => all.map((shop) => shop.id === id ? { ...shop, ...updates } : shop));
  const value = { shops, entries, join, advance, addShop, updateShop };
  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}
