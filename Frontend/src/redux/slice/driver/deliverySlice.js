import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// ✅ Validation helper
const validateFetchParams = ({ driverId, from_date, to_date }) => {
  if (!driverId) return "Driver ID is required";
  if (!from_date || !to_date) return "Both from_date and to_date are required";
  
  // Validate date format
  const fromDate = new Date(from_date);
  const toDate = new Date(to_date);
  
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return "Invalid date format";
  }
  
  if (fromDate > toDate) {
    return "from_date cannot be after to_date";
  }
  
  return null;
};

// ✅ Fetch deliveries with proper error handling and cancellation
export const fetchDeliverySummary = createAsyncThunk(
  "delivery/fetchDeliverySummary",
  async ({ driverId, from_date, to_date }, { signal, rejectWithValue }) => {
    try {
      // Validate inputs
      const validationError = validateFetchParams({ driverId, from_date, to_date });
      if (validationError) {
        return rejectWithValue(validationError);
      }

      // Build URL with proper encoding
      const params = new URLSearchParams({
        from_date: from_date,
        to_date: to_date
      });

      const url = `${API_BASE_URL}/driver/deliveries/${driverId}?${params}`;

      const res = await fetch(url, {
        credentials: "include",
        signal, // Support cancellation
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) {
        // Try to parse error response
        let errorMessage = `HTTP ${res.status}: Failed to fetch deliveries`;
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = res.statusText || errorMessage;
        }
        
        return rejectWithValue(errorMessage);
      }

      const data = await res.json();
      
      // Ensure we always return an array
      if (!Array.isArray(data)) {
        console.warn("API returned non-array data:", data);
        return [];
      }

      return data;
      
    } catch (err) {
      // Don't treat cancellation as an error
      if (err.name === 'AbortError') {
        return rejectWithValue('__CANCELLED__'); // Special flag
      }
      
      // Network or other errors
      console.error("fetchDeliverySummary error:", err);
      return rejectWithValue(
        err.message || "Network error: Failed to fetch deliveries"
      );
    }
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    deliveries: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    lastFetch: null,
    // ✅ Track request metadata
    currentRequest: null,
  },
  reducers: {
    // Clear error state
    clearDeliveryError: (state) => {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
    
    // Reset all delivery state
    resetDeliveries: (state) => {
      state.deliveries = [];
      state.status = "idle";
      state.error = null;
      state.lastFetch = null;
      state.currentRequest = null;
    },
    
    // ✅ Set deliveries from cache (optimistic update)
    setDeliveriesFromCache: (state, action) => {
      state.deliveries = action.payload;
      state.status = "succeeded";
      state.error = null;
      // Note: We intentionally don't set lastFetch for cached data
    },
    
    // ✅ Optimistically update a delivery (if needed for future features)
    updateDeliveryOptimistic: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.deliveries.findIndex(d => d.id === id);
      if (index !== -1) {
        state.deliveries[index] = { ...state.deliveries[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch deliveries - PENDING
      .addCase(fetchDeliverySummary.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        // Store request metadata for potential cancellation tracking
        state.currentRequest = {
          timestamp: Date.now(),
          params: action.meta.arg
        };
      })
      
      // ✅ Fetch deliveries - SUCCESS
      .addCase(fetchDeliverySummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deliveries = action.payload;
        state.error = null;
        state.lastFetch = Date.now();
        state.currentRequest = null;
      })
      
      // ✅ Fetch deliveries - FAILED
      .addCase(fetchDeliverySummary.rejected, (state, action) => {
        // Don't update state for cancelled requests
        if (action.payload === '__CANCELLED__') {
          // Just clear the current request, keep existing state
          state.currentRequest = null;
          return;
        }
        
        // Handle actual errors
        state.status = "failed";
        state.error = action.payload || "Failed to fetch deliveries";
        state.currentRequest = null;
        
        // ✅ Keep existing deliveries on error (optional - depends on UX preference)
        // If you want to clear on error, uncomment:
        // state.deliveries = [];
      });
  },
});

// ✅ Selectors (for better performance with reselect if needed later)
export const selectDeliveries = (state) => state.delivery.deliveries;
export const selectDeliveryStatus = (state) => state.delivery.status;
export const selectDeliveryError = (state) => state.delivery.error;
export const selectIsLoading = (state) => state.delivery.status === "loading";

// ✅ Memoized selector for delivery count (example)
export const selectDeliveryCount = (state) => state.delivery.deliveries.length;

// ✅ Selector for checking if data is stale (example usage)
export const selectIsDataStale = (state, maxAge = 5 * 60 * 1000) => {
  if (!state.delivery.lastFetch) return true;
  return Date.now() - state.delivery.lastFetch > maxAge;
};

export const { 
  clearDeliveryError, 
  resetDeliveries, 
  setDeliveriesFromCache,
  updateDeliveryOptimistic 
} = deliverySlice.actions;

export default deliverySlice.reducer;