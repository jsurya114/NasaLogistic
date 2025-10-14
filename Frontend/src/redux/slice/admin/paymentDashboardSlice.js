// src/features/paymentDashboard/paymentDashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

// Async thunk to fetch data
export const fetchPaymentDashboard = createAsyncThunk(
  "paymentDashboard/fetch",
  async (_, { getState }) => {
    const { data } = getState().paymentDashboard;

    // Only call API if no data is present
    if (data.length > 0) {
      return { success: true, data }; // return cached data
    }

    const response = await axios.get(`${API_BASE_URL}/admin/dashboard/paymentTable`);
    return response.data; // { success: true, data: [...] }
  }
);

const paymentDashboardSlice = createSlice({
  name: "paymentDashboard",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPaymentDashboard: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
      })
      .addCase(fetchPaymentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearPaymentDashboard } = paymentDashboardSlice.actions;
export default paymentDashboardSlice.reducer;
