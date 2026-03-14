// Price format — ₹67,999
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Date format — "12 Mar 2024"
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  }).format(new Date(date));
};

// Discount percentage calculate
export const getDiscount = (price, mrp) => {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
};

// Phone number validate
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// Condition grade color
export const getConditionColor = (grade) => {
  const colors = {
    LIKE_NEW:  "green",
    EXCELLENT: "blue",
    GOOD:      "yellow",
    FAIR:      "orange",
    DAMAGED:   "red",
  };
  return colors[grade] || "gray";
};

// Condition grade label
export const getConditionLabel = (grade) => {
  const labels = {
    LIKE_NEW:  "Like New",
    EXCELLENT: "Excellent",
    GOOD:      "Good",
    FAIR:      "Fair",
    DAMAGED:   "Damaged",
  };
  return labels[grade] || grade;
};

// Order status label
export const getOrderStatusLabel = (status) => {
  const labels = {
    PENDING:          "Pending",
    CONFIRMED:        "Confirmed",
    PROCESSING:       "Processing",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED:        "Delivered",
    CANCELLED:        "Cancelled",
  };
  return labels[status] || status;
};

// Order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    PENDING:          "yellow",
    CONFIRMED:        "blue",
    PROCESSING:       "purple",
    OUT_FOR_DELIVERY: "orange",
    DELIVERED:        "green",
    CANCELLED:        "red",
  };
  return colors[status] || "gray";
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};