import { apiClient } from "./apiClient.js";

// Mock menu data for development
const mockMenuData = [
  {
    id: 1,
    name: "Chicken Burger",
    description: "Juicy chicken burger with fresh vegetables",
    price: 12.99,
    category: "Burgers",
    image: "🍔",
    stock: 20,
    available: true
  },
  {
    id: 2,
    name: "Veg Pizza",
    description: "Fresh vegetable pizza with mozzarella cheese",
    price: 15.99,
    category: "Pizza",
    image: "🍕",
    stock: 15,
    available: true
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Fresh lettuce with caesar dressing and croutons",
    price: 8.99,
    category: "Salads",
    image: "🥗",
    stock: 25,
    available: true
  },
  {
    id: 4,
    name: "French Fries",
    description: "Crispy golden french fries",
    price: 4.99,
    category: "Sides",
    image: "🍟",
    stock: 30,
    available: true
  },
  {
    id: 5,
    name: "Chocolate Shake",
    description: "Rich chocolate milkshake",
    price: 6.99,
    category: "Beverages",
    image: "🥤",
    stock: 18,
    available: true
  },
  {
    id: 6,
    name: "Chicken Wings",
    description: "Spicy buffalo chicken wings",
    price: 11.99,
    category: "Appetizers",
    image: "🍗",
    stock: 22,
    available: true
  }
];

/**
 * Fetch all menu items
 */
export async function fetchMenu() {
  try {
    // For now, return mock data
    // In production, this would call: return await apiClient.get("/menu");
    return mockMenuData;
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return mockMenuData; // Fallback to mock data
  }
}

/**
 * Fetch menu items by category
 * @param {string} category
 */
export async function fetchMenuByCategory(category) {
  try {
    const menu = await fetchMenu();
    return menu.filter(item => item.category === category);
  } catch (error) {
    console.error(`Failed to fetch menu for category ${category}:`, error);
    return [];
  }
}

/**
 * Search menu items
 * @param {string} query
 */
export async function searchMenu(query) {
  try {
    const menu = await fetchMenu();
    const lowercaseQuery = query.toLowerCase();
    return menu.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error(`Failed to search menu for "${query}":`, error);
    return [];
  }
}

/**
 * Get menu item by ID
 * @param {string|number} id
 */
export async function getMenuItemById(id) {
  try {
    const menu = await fetchMenu();
    return menu.find(item => item.id === parseInt(id));
  } catch (error) {
    console.error(`Failed to fetch menu item ${id}:`, error);
    return null;
  }
}

/**
 * Subscribe to menu updates (for real-time updates)
 * @param {Object} options
 * @param {number} options.intervalMs
 * @param {Function} options.onData
 */
export function subscribeMenu({ intervalMs = 5000, onData }) {
  // Initial data
  onData(mockMenuData);
  
  // Set up interval for updates
  const interval = setInterval(async () => {
    try {
      const updatedMenu = await fetchMenu();
      onData(updatedMenu);
    } catch (error) {
      console.error("Failed to update menu:", error);
    }
  }, intervalMs);
  
  // Return unsubscribe function
  return () => clearInterval(interval);
}

/**
 * Update menu item stock
 * @param {string|number} itemId
 * @param {number} newStock
 */
export async function updateMenuItemStock(itemId, newStock) {
  try {
    // In production, this would call: return await apiClient.put(`/menu/${itemId}/stock`, { stock: newStock });
    console.log(`Updated stock for item ${itemId} to ${newStock}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to update stock for item ${itemId}:`, error);
    throw error;
  }
}
