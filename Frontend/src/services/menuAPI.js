import { apiClient } from "./apiClient.js";

/**
 * Fetch all menu items from backend
 */
export async function fetchMenu() {
  return await apiClient.get("/menu");
}

/**
 * Fetch menu items by category
 * @param {string} category
 */
export async function fetchMenuByCategory(category) {
  const all = await fetchMenu();
  return all.filter((item) => item.category === category);
}

/**
 * Search menu items
 * @param {string} query
 */
export async function searchMenu(query) {
  const all = await fetchMenu();
  const q = query.toLowerCase();
  return all.filter((item) =>
    item.name.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
}

/**
 * Get menu item by ID
 * @param {string} id
 */
export async function getMenuItemById(id) {
  return await apiClient.get(`/menu/${id}`);
}

/**
 * Subscribe to menu updates by polling backend
 * @param {{intervalMs?: number, onData: Function}} options
 */
export function subscribeMenu({ intervalMs = 5000, onData }) {
  let cancelled = false;
  async function tick() {
    try {
      const items = await fetchMenu();
      if (!cancelled) onData(items);
    } catch (err) {
      console.error("Menu polling failed:", err);
    } finally {
      if (!cancelled) setTimeout(tick, intervalMs);
    }
  }
  tick();
  return () => { cancelled = true; };
}

/**
 * Update menu item stock (admin usage)
 */
export async function updateMenuItemStock(itemId, newStock) {
  return await apiClient.put(`/menu/${itemId}`, { stock: newStock });
}
