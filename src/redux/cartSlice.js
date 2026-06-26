import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const initialState = {
  cartItems: loadCartFromLocalStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === newItem.productId
      );

      if (existingItem) {
        existingItem.qty += newItem.qty;
      } else {
        state.cartItems.push(newItem);
      }

      // Save to localStorage whenever cart changes
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload
      );

      // Save to localStorage whenever cart changes
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];

      // Save to localStorage whenever cart changes
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    updateCartItem: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.cartItems.find((item) => item.productId === productId);
      if (item) {
        item.qty = qty;
      }

      // Save to localStorage whenever cart changes
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateCartItem } =
  cartSlice.actions;

export default cartSlice.reducer;