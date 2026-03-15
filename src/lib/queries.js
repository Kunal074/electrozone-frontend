import api from "./api";

// ── PRODUCTS ──
export const getProducts = async (params) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const compareProducts = async (modelName) => {
  const res = await api.get(`/products/compare/${modelName}`);
  return res.data;
};

// ── USED PHONES ──
export const getUsedPhones = async (params) => {
  const res = await api.get("/used-phones", { params });
  return res.data;
};

export const getUsedPhoneById = async (id) => {
  const res = await api.get(`/used-phones/${id}`);
  return res.data;
};

// ── STORES ──
export const getStores = async (params) => {
  const res = await api.get("/stores", { params });
  return res.data;
};

export const getStoreById = async (id) => {
  const res = await api.get(`/stores/${id}`);
  return res.data;
};

// ── ORDERS ──
export const createOrder = async (data) => {
  const res = await api.post("/orders", data);
  return res.data;
};

export const getMyOrders = async (params) => {
  const res = await api.get("/orders/my", { params });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id) => {
  const res = await api.put(`/orders/${id}/cancel`);
  return res.data;
};

// ── PAYMENTS ──
export const createPaymentOrder = async (orderId) => {
  const res = await api.post("/payments/create-order", { orderId });
  return res.data;
};

export const verifyPayment = async (data) => {
  const res = await api.post("/payments/verify", data);
  return res.data;
};

// ── STORE OWNER ──
export const getStoreOrders = async (params) => {
  const res = await api.get("/orders/store/all", { params });
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await api.put(`/orders/${id}/status`, { status });
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post("/products", data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const updateStock = async (id, stock) => {
  const res = await api.patch(`/products/${id}/stock`, { stock });
  return res.data;
};

// ── ADMIN ──
export const getAllStores = async (params) => {
  const res = await api.get("/stores/admin/all", { params });
  return res.data;
};

export const approveStore = async (id, isApproved) => {
  const res = await api.patch(`/stores/${id}/approve`, { isApproved });
  return res.data;
};

// ── BANNERS ──
export const getBanners = async () => {
  const res = await api.get("/banners");
  return res.data;
};

export const createBanner = async (data) => {
  const res = await api.post("/banners", data);
  return res.data;
};

export const updateBanner = async (id, data) => {
  const res = await api.put(`/banners/${id}`, data);
  return res.data;
};

export const deleteBanner = async (id) => {
  const res = await api.delete(`/banners/${id}`);
  return res.data;
};

// ── OFFLINE SALES ──
export const createOfflineSale = async (data) => {
  const res = await api.post('/offline-sales', data);
  return res.data;
};
export const getStoreSales = async (params = {}) => {
  const res = await api.get('/offline-sales/store', { params });
  return res.data;
};
export const getOfflineSale = async (id) => {
  const res = await api.get(`/offline-sales/${id}`);
  return res.data;
};
export const deleteOfflineSale = async (id) => {
  const res = await api.delete(`/offline-sales/${id}`);
  return res.data;
};
export const getMyPurchases = async () => {
  const res = await api.get('/offline-sales/my/purchases');
  return res.data;
};

export const updateStore = async (id, data) => {
  const res = await api.put(`/stores/${id}`, data);
  return res.data;
};

// Tally API Key generate karo
export const generateTallyKey = async (storeId) => {
  const res = await api.post(`/stores/${storeId}/tally-key`);
  return res.data;
};

export const getTallyKey = async () => {
  const res = await api.get('/stores/my/tally-key');
  return res.data;
};

