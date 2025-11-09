import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

// Async thunk to fetch dashboard data (cities, drivers, routes)
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard/data`);
      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// NEW: Async thunk to fetch filtered payment table data
export const fetchFilteredPaymentData = createAsyncThunk(
  "dashboard/fetchFilteredPaymentData",
  async (filters, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard/paymentTable`, {
        params: filters
      });
      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    cities: [],
    drivers: [],
    routes: [],
    filteredPaymentData: [],
    loading: false,
    paymentLoading: false,
    error: null,
    paymentError: null,
    isFiltered: false, // NEW: Track if user has applied filters
  },
  reducers: {
    clearFilteredData: (state) => {
      state.filteredPaymentData = [];
      state.isFiltered = false; // Reset filter flag
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data (cities, drivers, routes)
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.cities || [];
        state.drivers = action.payload.drivers || [];
        state.routes = action.payload.routes || [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch filtered payment data
      .addCase(fetchFilteredPaymentData.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(fetchFilteredPaymentData.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.filteredPaymentData = action.payload;
        state.isFiltered = true; // Mark that filtering has occurred
      })
      .addCase(fetchFilteredPaymentData.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
        state.isFiltered = true; // Still mark as filtered even on error
      });
  },
});

export const { clearFilteredData } = dashboardSlice.actions;
export default dashboardSlice.reducer;