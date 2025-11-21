import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

// Async thunk to fetch dashboard data

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/doubleStop/tempDashboardData`);
      return res.data.data; // API returns { success: true, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const fetchWeeklyTempData = createAsyncThunk(
  "dashboard/fetchWeeklyTempData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/doubleStop/fetchWeeklyTempData`);
      return res.data.data; // API returns { success: true, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    // data: [],
    data:{weeklyData:[],dailyData:[]},
    loading: false,
    error: null,
  },
  reducers: {
    clearData:(state)=>{
      state.data={weeklyData:[],dailyData:[]};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data .dailyData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data";
      })
      .addCase(fetchWeeklyTempData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyTempData.fulfilled, (state, action) => {
        state.loading = false;
        // console.log("Data from weeklt Temp ",action.payload.data);
        state.data.weeklyData= action.payload.data;
      })
      .addCase(fetchWeeklyTempData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data";
      })
  },
});

export const {clearData} = dashboardSlice.actions ;
export default dashboardSlice.reducer;
