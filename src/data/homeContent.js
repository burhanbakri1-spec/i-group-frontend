export const homepageOffers = [
  {
    id: "offer-home-care",
    title: {
      en: "Daily care essentials",
      ar: "أساسيات العناية اليومية",
    },
    description: {
      en: "Selected cleaning and care products for a fresh home routine.",
      ar: "منتجات تنظيف وعناية مختارة لروتين منزلي منعش.",
    },
    image: "/images/products/multi-surface-cleaner.svg",
    ctaText: {
      en: "Shop home care",
      ar: "تسوق العناية المنزلية",
    },
    ctaLink: "products",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "offer-car-care",
    title: {
      en: "Car care favorites",
      ar: "مختارات العناية بالسيارة",
    },
    description: {
      en: "Gloss, freshness, and practical sizes for daily car care.",
      ar: "لمعان وانتعاش وأحجام عملية للعناية اليومية بالسيارة.",
    },
    image: "/images/products/car-shampoo-gloss.svg",
    ctaText: {
      en: "Explore car care",
      ar: "استكشف عناية السيارة",
    },
    ctaLink: "car-care",
    displayOrder: 2,
    isActive: true,
  },
];

export const reviews = [
  {
    id: "review-store-1",
    type: "site",
    rating: 5,
    customerName: "Maya A.",
    comment: {
      en: "Clean packaging, fast ordering, and the products feel premium for everyday use.",
      ar: "تغليف مرتب، طلب سريع، والمنتجات ممتازة للاستخدام اليومي.",
    },
    relatedProductName: "Multi-surface cleaner",
    employeeId: "",
    employeeName: "",
    createdAt: "2026-05-01",
    isActive: true,
  },
  {
    id: "review-store-2",
    type: "site",
    rating: 5,
    customerName: "Ahmad S.",
    comment: {
      en: "The car care products leave a clean finish without feeling harsh.",
      ar: "منتجات العناية بالسيارة تعطي نتيجة نظيفة بدون قسوة.",
    },
    relatedProductName: "Car care",
    employeeId: "",
    employeeName: "",
    createdAt: "2026-05-03",
    isActive: true,
  },
  {
    id: "review-employee-demo",
    type: "employee",
    rating: 5,
    customerName: "Lina K.",
    comment: {
      en: "Helpful service and clear product guidance.",
      ar: "خدمة ممتازة وتوضيح واضح للمنتجات.",
    },
    relatedProductName: "Customer service",
    employeeId: "employee-demo",
    employeeName: "EB Chemical Employee",
    createdAt: "2026-05-04",
    isActive: true,
  },
];
