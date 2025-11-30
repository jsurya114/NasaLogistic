import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// ✅ Entity adapters for normalized state
const citiesAdapter = createEntityAdapter({
  selectId: (city) => city.id,
});

const driversAdapter = createEntityAdapter({
  selectId: (driver) => driver.id,
  sortComparer: (a, b) => a.name?.localeCompare(b.name),
});

const routesAdapter = createEntityAdapter({
  selectId: (route) => route.id,
});

// ===== ASYNC THUNKS =====

// Fetch dashboard dropdown data (cities, drivers, routes)
export const fetchDashboardData = createAsyncThunk(
  "dash/fetchDashboardData",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/data`, {
        signal,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch dashboard data");
      }

      return data.data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message || "Network error");
    }
  },
  {
    // ✅ Prevent duplicate fetches
    condition: (_, { getState }) => {
      const { dash } = getState();
      return dash.dropdownStatus !== "loading" && dash.dropdownStatus !== "succeeded";
    },
  }
);

// Fetch filtered payment table data
export const fetchFilteredPaymentData = createAsyncThunk(
  "dash/fetchFilteredPaymentData",
  async (filters, { signal, rejectWithValue }) => {
    try {
      // ✅ Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      const res = await fetch(
        `${API_BASE_URL}/admin/dashboard/paymentTable?${params.toString()}`,
        {
          signal,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to fetch payment data");
      }

      return data.data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// ===== SLICE =====

const dashSlice = createSlice({
  name: "dash",
  initialState: {
    // Dropdown data
    cities: citiesAdapter.getInitialState(),
    drivers: driversAdapter.getInitialState(),
    routes: routesAdapter.getInitialState(),
    dropdownStatus: "idle", // idle | loading | succeeded | failed

    // Payment data
    filteredPaymentData: [],
    paymentStatus: "idle",
    isFiltered: false,

    // Errors
    error: null,
  },

  reducers: {
    clearFilteredData: (state) => {
      state.filteredPaymentData = [];
      state.isFiltered = false;
      state.paymentStatus = "idle";
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ===== FETCH DASHBOARD DATA =====
      .addCase(fetchDashboardData.pending, (state) => {
        state.dropdownStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.dropdownStatus = "succeeded";
        citiesAdapter.setAll(state.cities, action.payload.cities || []);
        driversAdapter.setAll(state.drivers, action.payload.drivers || []);
        routesAdapter.setAll(state.routes, action.payload.routes || []);
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.dropdownStatus = "failed";
          state.error = action.payload;
        }
      })

      // ===== FETCH FILTERED PAYMENT DATA =====
      .addCase(fetchFilteredPaymentData.pending, (state) => {
        state.paymentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchFilteredPaymentData.fulfilled, (state, action) => {
        state.paymentStatus = "succeeded";
        state.filteredPaymentData = action.payload || [];
        state.isFiltered = true;
        state.error = null;
      })
      .addCase(fetchFilteredPaymentData.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.paymentStatus = "failed";
          state.error = action.payload;
          state.isFiltered = true;
        }
      });
  },
});

// ===== EXPORTS =====

export const { clearFilteredData, clearError } = dashSlice.actions;

// ✅ Selectors for cities
export const {
  selectAll: selectAllCities,
  selectById: selectCityById,
} = citiesAdapter.getSelectors((state) => state.dash.cities);

// ✅ Selectors for drivers
export const {
  selectAll: selectAllDrivers,
  selectById: selectDriverById,
} = driversAdapter.getSelectors((state) => state.dash.drivers);

// ✅ Selectors for routes
export const {
  selectAll: selectAllRoutes,
  selectById: selectRouteById,
} = routesAdapter.getSelectors((state) => state.dash.routes);

export default dashSlice.reducer;