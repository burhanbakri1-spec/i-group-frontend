import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
}

interface WishlistItem {
  id: string;
  name: string;
  title: string;
  price: string;
  image: string;
  badge?: string;
  rating?: string;
  reviews?: string;
}

interface ShopContextType {
  // Cart
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlistItems: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Cart Functions
  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name || product.title,
        title: product.title || product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist Functions
  const addToWishlist = (product: any) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, {
        id: product.id,
        name: product.name || product.title,
        title: product.title,
        price: product.price,
        image: product.image,
        badge: product.badge,
        rating: product.rating,
        reviews: product.reviews
      }];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some(item => item.id === id);
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
};
