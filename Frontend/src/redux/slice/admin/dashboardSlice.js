// src/redux/slice/admin/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --------- Async Thunks (Dashboard specific APIs) ----------
// export const fetchDashboardData = createAsyncThunk(
//   "dashboard/fetchData",
//   async (_, { rejectWithValue }) => {
//     try {
//       const [jobsRes, driversRes, routesRes, tableRes] = await Promise.all([
//         axios.get("/api/dashboard/jobs"),     // API only for jobs in dashboard
//         axios.get("/api/dashboard/drivers"),  // API only for dashboard drivers
//         axios.get("/api/dashboard/routes"),   // API only for dashboard routes
//         axios.get("/api/dashboard/driver-jobs"), // Table data
//       ]);

//       return {
//         jobs: jobsRes.data,
//         drivers: driversRes.data,
//         routes: routesRes.data,
//         driverJobs: tableRes.data,
//       };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// --------- Slice ----------
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    filters: {
      job: "All",
      driver: "All",
      route: "All",
      startDate: "",
      endDate: "",
      paymentStatus: "All",
      companyEarnings: false,
    },
    jobs: [],
    drivers: [],
    routes: [],
    driverJobs: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    resetFilters: (state) => {
      state.filters = {
        job: "All",
        driver: "All",
        route: "All",
        startDate: "",
        endDate: "",
        paymentStatus: "All",
        companyEarnings: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.drivers = action.payload.drivers;
        state.routes = action.payload.routes;
        state.driverJobs = action.payload.driverJobs;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters } = dashboardSlice.actions;
export default dashboardSlice.reducer;
