import { apiClient } from "./apiClient.js";

/**
 * Create a new order
 * @param {Object} params
 * @param {string} params.userId
 * @param {Array} params.items
 * @param {string} [params.shippingAddress]
 * @param {string} [params.paymentMethod]
 */
export async function createOrder({ userId, items, shippingAddress, paymentMethod }) {
  try {
    const orderData = {
      userId,
      items,
      ...(shippingAddress && { shippingAddress }),
      ...(paymentMethod && { paymentMethod }),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    return await apiClient.post("/orders", orderData);
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
}

/**
 * Fetch the active order for a user
 * @param {string} userId
 */
export async function fetchActiveOrder(userId) {
  try {
    return await apiClient.get(
      `/orders/active?userId=${encodeURIComponent(userId)}`
    );
  } catch (error) {
    console.warn("No active order found:", error);
    return null;
  }
}

/**
 * Cancel an order by ID
 * @param {string} orderId
 * @param {string} [reason]
 */
export async function cancelOrder(orderId, reason = "User cancelled") {
  try {
    return await apiClient.post(`/orders/${orderId}/cancel`, { reason });
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    throw new Error(`Failed to cancel order: ${error.message}`);
  }
}

/**
 * Fetch the order history of a user
 * @param {string} userId
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
export async function fetchOrderHistory(userId, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams({
      userId: userId,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return await apiClient.get(`/orders/history?${params}`);
  } catch (error) {
    console.warn("Failed to fetch order history:", error);
    return [];
  }
}

/**
 * Get order details by ID
 * @param {string} orderId
 */
export async function getOrderById(orderId) {
  try {
    return await apiClient.get(`/orders/${orderId}`);
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
}

/**
 * Update order status
 * @param {string} orderId
 * @param {string} status
 * @param {string} [notes]
 */
export async function updateOrderStatus(orderId, status, notes = "") {
  try {
    return await apiClient.put(`/orders/${orderId}/status`, { status, notes });
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
}

/**
 * Add items to an existing order
 * @param {string} orderId
 * @param {Array} items
 */
export async function addItemsToOrder(orderId, items) {
  try {
    return await apiClient.post(`/orders/${orderId}/items`, { items });
  } catch (error) {
    console.error(`Failed to add items to order ${orderId}:`, error);
    throw new Error(`Failed to add items to order: ${error.message}`);
  }
}

/**
 * Remove items from an order
 * @param {string} orderId
 * @param {Array} itemIds
 */
export async function removeItemsFromOrder(orderId, itemIds) {
  try {
    // Send JSON body in DELETE via options
    return await apiClient.del(`/orders/${orderId}/items`, { body: { itemIds } });
  } catch (error) {
    console.error(`Failed to remove items from order ${orderId}:`, error);
    throw new Error(`Failed to remove items from order: ${error.message}`);
  }
}

/**
 * Calculate order total
 * @param {Array} items
 * @returns {number}
 */
export function calculateOrderTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

/**
 * Validate order data before submission
 * @param {Object} orderData
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateOrderData(orderData) {
  const errors = [];
  
  if (!orderData.userId) {
    errors.push("User ID is required");
  }
  
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push("Order must contain at least one item");
  }
  
  if (orderData.items) {
    orderData.items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1} must have an ID`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1} must have a valid quantity`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1} must have a valid price`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get order status display text
 * @param {string} status
 * @returns {string}
 */
export function getOrderStatusDisplay(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  
  return statusMap[status] || status;
}

/**
 * Check if order can be cancelled
 * @param {string} status
 * @returns {boolean}
 */
export function canCancelOrder(status) {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  return cancellableStatuses.includes(status);
}

/**
 * Check if order can be modified
 * @param {string} status
 * @returns {boolean}
 */
export function canModifyOrder(status) {
  const modifiableStatuses = ['pending', 'confirmed'];
  return modifiableStatuses.includes(status);
}
