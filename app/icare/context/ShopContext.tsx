import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuthSession, BackendCart, CartItem, Product, WishlistItem, ShopContextType } from '../types';
import { IcareApiError, icareApi } from '../lib/api-client';
import { mapBackendCartToCartItems } from '../lib/mappers';

const GUEST_CART_STORAGE_KEY = 'icare_guest_cart';
const WISHLIST_STORAGE_KEY = 'icare_wishlist';
const AUTH_STORAGE_KEY = 'icare_auth_session';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const canUseStorage = () => typeof window !== 'undefined';

const readStoredArray = <T,>(key: string): T[] => {
  if (!canUseStorage()) return [];
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return [];
  try {
    return JSON.parse(rawValue) as T[];
  } catch {
    return [];
  }
};

const writeStoredArray = <T,>(key: string, value: T[]) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const readStoredSession = (): AuthSession | null => {
  if (!canUseStorage()) return null;
  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    return null;
  }
};

const writeStoredSession = (session: AuthSession | null) => {
  if (!canUseStorage()) return;
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const getProductUnitPrice = (item: CartItem) => item.rawPrice ?? Number(item.price.replace(/[^0-9.]/g, ''));

const getProductIdentity = (product: Product) => String(product.backendId ?? product.sourceProductId ?? product.id);

const getVariantIdentity = (product: Product) => product.variantId ?? 'default';

const getCartLineId = (product: Product) => `${getProductIdentity(product)}:${getVariantIdentity(product)}`;

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStoredArray<CartItem>(GUEST_CART_STORAGE_KEY));
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => readStoredArray<WishlistItem>(WISHLIST_STORAGE_KEY));
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [authError, setAuthError] = useState<string | null>(null);

  const accessToken = session?.accessToken ?? null;
  const user = session?.user ?? null;
  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    writeStoredArray(WISHLIST_STORAGE_KEY, wishlistItems);
  }, [wishlistItems]);

  useEffect(() => {
    if (!isAuthenticated) {
      writeStoredArray(GUEST_CART_STORAGE_KEY, cartItems);
    }
  }, [cartItems, isAuthenticated]);

  const clearSession = useCallback(() => {
    setSession(null);
    writeStoredSession(null);
  }, []);

  const refreshSession = useCallback(async (currentSession: AuthSession) => {
    if (!icareApi.isConfigured()) throw new IcareApiError('iCare API is not configured.', 0);
    try {
      const nextSession = await icareApi.auth.refresh(currentSession.refreshToken);
      setSession(nextSession);
      writeStoredSession(nextSession);
      setAuthError(null);
      return nextSession;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const runCartRequest = useCallback(async (operation: (token: string) => Promise<BackendCart>, currentSession = session) => {
    if (!currentSession || !icareApi.isConfigured()) return;

    try {
      const backendCart = await operation(currentSession.accessToken);
      setCartItems(mapBackendCartToCartItems(backendCart));
    } catch (error) {
      if (error instanceof IcareApiError && error.status === 401) {
        const nextSession = await refreshSession(currentSession);
        const backendCart = await operation(nextSession.accessToken);
        setCartItems(mapBackendCartToCartItems(backendCart));
        return;
      }
      throw error;
    }
  }, [refreshSession, session]);

  const refreshCart = useCallback(async () => {
    await runCartRequest((token) => icareApi.cart.get(token));
  }, [runCartRequest]);

  useEffect(() => {
    if (accessToken && icareApi.isConfigured()) {
      const refreshTimer = window.setTimeout(() => {
        refreshCart()
          .catch((error: Error) => setAuthError(error.message));
      }, 0);
      return () => window.clearTimeout(refreshTimer);
    }
    return undefined;
  }, [accessToken, refreshCart]);

  const addGuestCartItem = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const cartLineId = getCartLineId(product);
      const existing = prev.find((item) => item.id === cartLineId || item.cartLineId === cartLineId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartLineId || item.cartLineId === cartLineId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, {
        ...product,
        id: cartLineId,
        cartLineId,
        sourceProductId: product.sourceProductId ?? product.id,
        name: product.name || product.title || 'Product',
        title: product.title || product.name || 'Product',
        quantity,
      }];
    });
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (session && product.backendId && icareApi.isConfigured()) {
      runCartRequest((token) => icareApi.cart.add(token, product.backendId as number, product.variantId, quantity), session)
        .catch((error: Error) => {
          setAuthError(error.message);
          addGuestCartItem(product, quantity);
        });
      return;
    }

    addGuestCartItem(product, quantity);
  };

  const removeFromCart = (id: string) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (session && item?.cartItemId && icareApi.isConfigured()) {
      runCartRequest((token) => icareApi.cart.remove(token, item.cartItemId as number), session)
        .catch((error: Error) => setAuthError(error.message));
      return;
    }
    setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cartItems.find((cartItem) => cartItem.id === id);
    if (session && item?.cartItemId && icareApi.isConfigured()) {
      runCartRequest((token) => icareApi.cart.update(token, item.cartItemId as number, quantity), session)
        .catch((error: Error) => setAuthError(error.message));
      return;
    }

    setCartItems((prev) => prev.map((cartItem) => cartItem.id === id ? { ...cartItem, quantity } : cartItem));
  };

  const clearCart = () => {
    if (session && icareApi.isConfigured()) {
      runCartRequest((token) => icareApi.cart.clear(token), session)
        .catch((error: Error) => setAuthError(error.message));
      return;
    }
    setCartItems([]);
  };

  const adoptSession = async (nextSession: AuthSession) => {
    setSession(nextSession);
    writeStoredSession(nextSession);
    setAuthError(null);

    const guestItems = readStoredArray<CartItem>(GUEST_CART_STORAGE_KEY);
    if (icareApi.isConfigured()) {
      await Promise.all(guestItems
        .filter((item) => item.backendId)
        .map((item) => icareApi.cart.add(nextSession.accessToken, item.backendId as number, item.variantId, item.quantity)));
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      const backendCart = await icareApi.cart.get(nextSession.accessToken);
      setCartItems(mapBackendCartToCartItems(backendCart));
    }
  };

  const login = async (email: string, password: string) => {
    const nextSession = await icareApi.auth.login(email, password);
    await adoptSession(nextSession);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const nextSession = await icareApi.auth.register(name, email, password, phone);
    await adoptSession(nextSession);
  };

  const logout = async () => {
    if (accessToken && icareApi.isConfigured()) {
      await icareApi.auth.logout(accessToken).catch((error: Error) => setAuthError(error.message));
    }
    clearSession();
    setCartItems(readStoredArray<CartItem>(GUEST_CART_STORAGE_KEY));
  };

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + (getProductUnitPrice(item) * item.quantity), 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, { ...product, addedAt: new Date() }];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: string) => wishlistItems.some((item) => item.id === id);

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
        isInWishlist,
        user,
        accessToken,
        isAuthenticated,
        authError,
        login,
        register,
        logout,
        refreshCart,
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
