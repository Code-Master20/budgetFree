import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../api";

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  try {
    const res = await API.get("/auth/me");
    return res.data;
  } catch {
    return null;
  }
});

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (form, thunkAPI) => {
    try {
      await API.post("/auth/login", form);
      const res = await API.get("/auth/me");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await API.post("/auth/logout");
      return null;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Logout failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    hasCheckedAuth: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.hasCheckedAuth = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.hasCheckedAuth = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.hasCheckedAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasCheckedAuth = true;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
        state.hasCheckedAuth = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
