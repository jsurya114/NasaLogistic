import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch deliveries for driver with request cancellation support
export const fetchDeliverySummary = createAsyncThunk(
  "delivery/fetchDeliverySummary",
  async ({ driverId, from_date, to_date }, { signal, rejectWithValue }) => {
    try {
      // Input validation
      if (!driverId) {
        return rejectWithValue("Driver ID is required");
      }

      if (!from_date || !to_date) {
        return rejectWithValue("Both from_date and to_date are required");
      }

      const res = await fetch(
        `${API_BASE_URL}/driver/deliveries/${driverId}?from_date=${encodeURIComponent(from_date)}&to_date=${encodeURIComponent(to_date)}`,
        {
          credentials: "include",
          signal, // Support request cancellation
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return rejectWithValue(errorData.message || errorData.error || "Failed to fetch deliveries");
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      // Don't log cancellation errors
      if (err.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchDeliverySummary error:", err);
      return rejectWithValue(err.message || "Error fetching deliveries");
    }
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    deliveries: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    lastFetch: null, // Track when data was last fetched
  },
  reducers: {
    // Clear error state
    clearDeliveryError: (state) => {
      state.error = null;
    },
    
    // Reset deliveries state
    resetDeliveries: (state) => {
      state.deliveries = [];
      state.status = "idle";
      state.error = null;
      state.lastFetch = null;
    },
    
    // New: Set deliveries from cache without triggering loading state
    setDeliveriesFromCache: (state, action) => {
      state.deliveries = action.payload;
      state.status = "succeeded";
      state.error = null;
      // Don't update lastFetch for cached data
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliverySummary.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDeliverySummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log("Deliveries ",action.payload);
        state.deliveries = action.payload;
        state.error = null;
        state.lastFetch = Date.now();
      })
      .addCase(fetchDeliverySummary.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== 'Request cancelled') {
          state.status = "failed";
          state.error = action.payload || "Failed to fetch deliveries";
          state.deliveries = []; // Clear deliveries on error
        }
      });
  },
});

export const { clearDeliveryError, resetDeliveries, setDeliveriesFromCache } = deliverySlice.actions;
export default deliverySlice.reducer;