import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config";

// Async thunk to fetch driver payment data
export const fetchDriverPayment = createAsyncThunk(
  "driverPayment/fetchDriverPayment",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/doubleStop/calculatePayment`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const driverPaymentSlice = createSlice({
  name: "driverPayment",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        toast.success("Driver payment calculated successfully!");
      })
      .addCase(fetchDriverPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      });
  },
});

export default driverPaymentSlice.reducer;
