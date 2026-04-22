import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";

// 🔥 check login (cookie-based)
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/auth/me");
      return res.data;
    } catch {
      return null;
    }
  },
);

// 🔥 login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (form, thunkAPI) => {
    try {
      await API.post("/auth/login", form);
      const res = await API.get("/auth/me");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
