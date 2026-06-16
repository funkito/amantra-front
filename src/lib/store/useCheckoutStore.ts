'use client';

import { create } from 'zustand';
import type { CatalogProduct } from '@/lib/catalog/types';

export interface CartItem extends CatalogProduct {
  quantity: number;
}

interface CheckoutState {
  step: 'cart' | 'auth_modal' | 'shipping' | 'payment' | 'processing' | 'success';
  isAuthModalOpen: boolean;
  isCartOpen: boolean;
  cartItems: CartItem[];
  setStep: (step: CheckoutState['step']) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CatalogProduct) => void;
  removeFromCart: (itemId: string) => void;
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  step: 'cart',
  isAuthModalOpen: false,
  isCartOpen: false,
  cartItems: [],

  setStep: (step) => set({ step }),

  openAuthModal: () => set({ isAuthModalOpen: true, step: 'auth_modal' }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  openCart: () => set({ isCartOpen: true, step: 'cart' }),

  closeCart: () => set({ isCartOpen: false }),

  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return {
          isCartOpen: true,
          cartItems: state.cartItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        };
      }

      return {
        isCartOpen: true,
        cartItems: [...state.cartItems, { ...item, quantity: 1 }],
      };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== itemId),
    })),

  incrementItem: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    })),

  decrementItem: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ cartItems: [], isCartOpen: false }),
}));
