/**
 * Shared type definitions for iCare application
 */

export interface Product {
  id: string;
  title?: string;
  name: string;
  price: string;
  description?: string;
  image: string;
  rating?: string | undefined;
  reviews?: string;
  badge?: string;
  brand?: string;
  category?: string;
  stock?: number;
  main?: string;
  sub?: string;
  type?: string;
  rawPrice?: number;
  date?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {
  addedAt?: Date;
}

export interface Brand {
  name: string;
  country: string;
  products?: Product[];
}

export interface Category {
  name: string;
  subcategories?: string[];
  products?: Product[];
}

export interface Review {
  name: string;
  verified: boolean;
  age: string;
  concern: string;
  rating: number;
  text: string;
  date?: string;
}

export interface FilterOptions {
  brands?: string[];
  categories?: string[];
  priceRange?: [number, number];
  rating?: number;
}

export interface ShopContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
}

export interface WixProduct {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  media?: {
    image: string;
  }[];
  variants?: {
      choices: {
      name: string;
      value: string;
    }[];
  }[];
  stock?: {
      inStock: boolean;
      quantity: number;
  };
}
