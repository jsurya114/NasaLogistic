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


export const updateWeeklyExcelToDashboard = createAsyncThunk(
  "driverPayment/update-weekly-excel-to-dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/admin/doubleStop/update-weekly-excel-to-dashboard`);
      console.log("Data after updating data in dashboard ",res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);
const driverPaymentSlice = createSlice({
  name: "driverPayment",
  initialState: {
    message:true,
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
      })
      .addCase(updateWeeklyExcelToDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWeeklyExcelToDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data=null;
      })
      .addCase(updateWeeklyExcelToDashboard.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })
  },
});

export default driverPaymentSlice.reducer;
