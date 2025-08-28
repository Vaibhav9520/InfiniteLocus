// Temporary dummy API
export const getOrders = async () => {
  return [
    { id: 1, menuName: "Burger", status: "PENDING", expires_at: new Date(Date.now() + 300000).toISOString() },
    { id: 2, menuName: "Pizza", status: "CANCELLED" },
  ];
};

export const getOrderHistory = async () => {
  return [
    { id: 1, menuName: "Burger", status: "PICKED" },
    { id: 2, menuName: "Pizza", status: "CANCELLED" },
  ];
};
