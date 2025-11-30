import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch all routes (for driver app) with request cancellation
export const fetchRoutes = createAsyncThunk(
  "routes/fetchRoutes", 
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/routes-list`, { signal, credentials: 'include' });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.error || "Failed to fetch routes");
      }
      
      const data = await res.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchRoutes error:", error);
      return rejectWithValue(error.message);
    }
  },
  {
    // Prevent duplicate fetches - check status before dispatching
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.routesStatus !== 'loading' && journey.routesStatus !== 'succeeded';
    },
  }
);

// Fetch routes for admin panel with request cancellation
export const fetchAdminRoutes = createAsyncThunk(
  "routes/fetchAdminRoutes", 
  async (_, { signal, rejectWithValue }) => {
    try {
      // Use routes-list endpoint instead of paginated routes endpoint
      const res = await fetch(`${API_BASE_URL}/admin/routes-list`, { 
        signal, 
        credentials: 'include' 
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.error || "Failed to fetch admin routes");
      }
      
      const data = await res.json();
      // Handle different response formats
      return data.routes || data.data || data || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchAdminRoutes error:", error);
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.routesStatus !== 'loading' && journey.routesStatus !== 'succeeded';
    },
  }
);

// Fetch today's journey with request cancellation
export const fetchTodayJourney = createAsyncThunk(
  "journeys/fetchTodayJourney",
  async (driver_id, { signal, rejectWithValue }) => {
    try {
      if (!driver_id) {
        return rejectWithValue("Driver ID is required");
      }

      const res = await fetch(`${API_BASE_URL}/driver/journey/${driver_id}`, { signal, credentials: 'include' });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.message || "Failed to fetch journey");
      }
      
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchTodayJourney error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Save journey
export const saveJourney = createAsyncThunk(
  "journeys/saveJourney",
  async (journeyData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journeyData),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return rejectWithValue(data);
      }
      
      return data.data;
    } catch (error) {
      console.error("saveJourney error:", error);
      return rejectWithValue({ message: error.message });
    }
  }
);

// Fetch all journeys (admin)
export const fetchAllJourneys = createAsyncThunk(
  "journeys/fetchAllJourneys",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journeys`, { signal, credentials: 'include' });
      
      if (!res.ok) {
        return rejectWithValue("Failed to fetch all journeys");
      }
      
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchAllJourneys error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Add journey (admin)
export const addJourney = createAsyncThunk(
  "journeys/addJourney",
  async (journeyData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journeyData),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return rejectWithValue(data);
      }
      
      return data.data;
    } catch (error) {
      console.error("addJourney error:", error);
      return rejectWithValue({ message: error.message });
    }
  }
);

// Fetch all drivers with caching
export const fetchAllDrivers = createAsyncThunk(
  "drivers/fetchAll",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/drivers`, { signal, credentials: 'include' });
      
      if (!res.ok) {
        return rejectWithValue("Failed to fetch drivers");
      }
      
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchAllDrivers error:", error);
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.driversStatus !== 'loading' && journey.driversStatus !== 'succeeded';
    },
  }
);

// Update journey (admin)
export const updateJourney = createAsyncThunk(
  "journeys/updateJourney",
  async ({ journey_id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journey/${journey_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: 'include',
      });

      const data = await res.json();

      // FIX: properly handle backend validation errors
      if (!res.ok) {
        return rejectWithValue(data); // contains { errors: ... }
      }

      return data.data;
    } catch (error) {
      console.error("updateJourney error:", error);
      return rejectWithValue({ message: error.message });
    }
  }
);


const journeySlice = createSlice({
  name: "journey",
  initialState: {
    routes: [],
    routesStatus: "idle",
    routesError: null,
    journeys: [],
    journeyStatus: "idle",
    journeyError: null,
    adminJourneys: [],
    adminStatus: "idle",
    adminError: null,
    drivers: [],
    driversStatus: "idle",
    driversError: null,
  },
  reducers: {
    clearRoutesError(state) {
      state.routesError = null;
    },
    clearJourneyError(state) {
      state.journeyError = null;
      state.adminError = null;
    },
    resetRoutesStatus(state) {
      state.routesStatus = "idle";
    },
    resetJourneyStatus(state) {
      state.journeyStatus = "idle";
    },
    // Reset all status to force fresh data fetch
    resetAllStatus(state) {
      state.routesStatus = "idle";
      state.journeyStatus = "idle";
      state.adminStatus = "idle";
      state.driversStatus = "idle";
    },
    // Clear all data (useful for logout)
    clearAllData(state) {
      state.routes = [];
      state.journeys = [];
      state.adminJourneys = [];
      state.drivers = [];
      state.routesStatus = "idle";
      state.journeyStatus = "idle";
      state.adminStatus = "idle";
      state.driversStatus = "idle";
      state.routesError = null;
      state.journeyError = null;
      state.adminError = null;
      state.driversError = null;
    },
  },
  extraReducers: (builder) => {
    // ============ ROUTES (Driver app) ============
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.routesStatus = "loading";
        state.routesError = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routesStatus = "succeeded";
        const routesData = action.payload?.routes || action.payload?.data || action.payload || [];
        state.routes = Array.isArray(routesData) ? routesData : [];
        state.routesError = null;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        // Don't set error for cancelled requests
        if (action.payload !== 'Request cancelled') {
          state.routesStatus = "failed";
          state.routesError = action.payload || action.error.message;
        }
      });

    // ============ ADMIN ROUTES ============
    builder
      .addCase(fetchAdminRoutes.pending, (state) => {
        state.routesStatus = "loading";
        state.routesError = null;
      })
      .addCase(fetchAdminRoutes.fulfilled, (state, action) => {
        state.routesStatus = "succeeded";
        const routesData = action.payload?.routes || action.payload?.data || action.payload || [];
        state.routes = Array.isArray(routesData) ? routesData : [];
        state.routesError = null;
      })
      .addCase(fetchAdminRoutes.rejected, (state, action) => {
        if (action.payload !== 'Request cancelled') {
          state.routesStatus = "failed";
          state.routesError = action.payload || action.error.message;
        }
      });

    // ============ JOURNEYS ============
    builder
      .addCase(fetchTodayJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(fetchTodayJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        state.journeys = Array.isArray(action.payload) ? action.payload : [];
        state.journeyError = null;
      })
      .addCase(fetchTodayJourney.rejected, (state, action) => {
        if (action.payload !== 'Request cancelled') {
          state.journeyStatus = "failed";
          state.journeyError = action.payload || action.error.message;
        }
      })
      .addCase(saveJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(saveJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        // Add to journeys array if not duplicate
        const exists = state.journeys.some(j => j.id === action.payload.id);
        if (!exists) {
          state.journeys.unshift(action.payload); // Add at beginning
        }
        state.journeyError = null;
      })
      .addCase(saveJourney.rejected, (state, action) => {
        state.journeyStatus = "failed";
        state.journeyError = action.payload?.message || action.error.message;
      });

    // ============ ADMIN JOURNEYS ============
    builder
      .addCase(fetchAllJourneys.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(fetchAllJourneys.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminJourneys = Array.isArray(action.payload) ? action.payload : [];
        state.adminError = null;
      })
      .addCase(fetchAllJourneys.rejected, (state, action) => {
        if (action.payload !== 'Request cancelled') {
          state.adminStatus = "failed";
          state.adminError = action.payload || action.error.message;
        }
      })
      .addCase(addJourney.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(addJourney.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminJourneys.unshift(action.payload);
        state.adminError = null;
      })
      .addCase(addJourney.rejected, (state, action) => {
        const isValidationError = action.payload?.errors && Object.keys(action.payload.errors).length > 0;

state.adminStatus = isValidationError ? "succeeded" : "failed"; 
state.adminError = action.payload?.message || "Failed to add journey";

      })
      .addCase(updateJourney.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(updateJourney.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        const index = state.adminJourneys.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.adminJourneys[index] = action.payload;
        }
        state.adminError = null;
      })
      .addCase(updateJourney.rejected, (state, action) => {
        // Don’t mark as "failed" for validation errors
  const isValidationError = action.payload?.errors && Object.keys(action.payload.errors).length > 0;
  state.adminStatus = isValidationError ? "succeeded" : "failed";

  state.adminError = isValidationError
    ? null
    : (action.payload?.message || "Failed to update journey");

      });

    // ============ DRIVERS ============
    builder
      .addCase(fetchAllDrivers.pending, (state) => {
        state.driversStatus = "loading";
        state.driversError = null;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.driversStatus = "succeeded";
        state.drivers = Array.isArray(action.payload) ? action.payload : [];
        state.driversError = null;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        if (action.payload !== 'Request cancelled') {
          state.driversStatus = "failed";
          state.driversError = action.payload || action.error.message;
        }
      });
  },
});

export const {
  clearRoutesError,
  clearJourneyError,
  resetRoutesStatus,
  resetJourneyStatus,
  resetAllStatus,
  clearAllData,
} = journeySlice.actions;

export default journeySlice.reducer;