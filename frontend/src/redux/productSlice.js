import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../api";

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const res = await API.get("/products");
  return res.data;
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
    total: 0,
    pages: 0,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load products";
      });
  },
});

export default productSlice.reducer;
