import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// ✅ Entity adapters for normalized state
const journeysAdapter = createEntityAdapter({
  selectId: (journey) => journey.id,
  sortComparer: (a, b) => new Date(b.journey_date) - new Date(a.journey_date),
});

const routesAdapter = createEntityAdapter({
  selectId: (route) => route.id,
});

const driversAdapter = createEntityAdapter({
  selectId: (driver) => driver.id,
  sortComparer: (a, b) => a.name?.localeCompare(b.name),
});

// ===== ASYNC THUNKS =====

// Fetch routes for driver app
export const fetchRoutes = createAsyncThunk(
  "journey/fetchRoutes",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/routes-list`, {
        signal,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.error || "Failed to fetch routes");
      }

      const data = await res.json();
      return data.routes || data.data || data || [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.routesStatus !== "loading";
    },
  }
);

// Fetch routes for admin panel
export const fetchAdminRoutes = createAsyncThunk(
  "journey/fetchAdminRoutes",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/routes-list`, {
        signal,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.error || "Failed to fetch admin routes");
      }

      const data = await res.json();
      return data.routes || data.data || data || [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.routesStatus !== "loading";
    },
  }
);

// Fetch today's journey
export const fetchTodayJourney = createAsyncThunk(
  "journey/fetchTodayJourney",
  async (driver_id, { signal, rejectWithValue }) => {
    try {
      if (!driver_id) {
        return rejectWithValue("Driver ID is required");
      }

      const res = await fetch(`${API_BASE_URL}/driver/journey/${driver_id}`, {
        signal,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return rejectWithValue(error.message || "Failed to fetch journey");
      }

      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message);
    }
  }
);

// Save journey
export const saveJourney = createAsyncThunk(
  "journey/saveJourney",
  async (journeyData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journeyData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Fetch all journeys (admin)
export const fetchAllJourneys = createAsyncThunk(
  "journey/fetchAllJourneys",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journeys`, {
        signal,
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to fetch all journeys");
      }

      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message);
    }
  }
);

// Add journey (admin)
export const addJourney = createAsyncThunk(
  "journey/addJourney",
  async (journeyData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journeyData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// Fetch all drivers
export const fetchAllDrivers = createAsyncThunk(
  "journey/fetchAllDrivers",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/drivers`, {
        signal,
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Failed to fetch drivers");
      }

      const data = await res.json();
      return data.data || [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { journey } = getState();
      return journey.driversStatus !== "loading";
    },
  }
);

// Update journey (admin)
export const updateJourney = createAsyncThunk(
  "journey/updateJourney",
  async ({ journey_id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/journey/${journey_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue({ message: error.message });
    }
  }
);

// ===== SLICE =====

const journeySlice = createSlice({
  name: "journey",
  initialState: {
    // Routes
    routes: routesAdapter.getInitialState(),
    routesStatus: "idle",
    routesError: null,

    // Driver journeys
    journeys: journeysAdapter.getInitialState(),
    journeyStatus: "idle",
    journeyError: null,

    // Admin journeys
    adminJourneys: journeysAdapter.getInitialState(),
    adminStatus: "idle",
    adminError: null,

    // Drivers
    drivers: driversAdapter.getInitialState(),
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
    resetAllStatus(state) {
      state.routesStatus = "idle";
      state.journeyStatus = "idle";
      state.adminStatus = "idle";
      state.driversStatus = "idle";
    },
    clearAllData(state) {
      routesAdapter.removeAll(state.routes);
      journeysAdapter.removeAll(state.journeys);
      journeysAdapter.removeAll(state.adminJourneys);
      driversAdapter.removeAll(state.drivers);
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
    builder
      // ===== ROUTES (Driver) =====
      .addCase(fetchRoutes.pending, (state) => {
        state.routesStatus = "loading";
        state.routesError = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routesStatus = "succeeded";
        routesAdapter.setAll(state.routes, action.payload);
        state.routesError = null;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.routesStatus = "failed";
          state.routesError = action.payload;
        }
      })

      // ===== ADMIN ROUTES =====
      .addCase(fetchAdminRoutes.pending, (state) => {
        state.routesStatus = "loading";
        state.routesError = null;
      })
      .addCase(fetchAdminRoutes.fulfilled, (state, action) => {
        state.routesStatus = "succeeded";
        routesAdapter.setAll(state.routes, action.payload);
        state.routesError = null;
      })
      .addCase(fetchAdminRoutes.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.routesStatus = "failed";
          state.routesError = action.payload;
        }
      })

      // ===== TODAY'S JOURNEY =====
      .addCase(fetchTodayJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(fetchTodayJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        journeysAdapter.setAll(state.journeys, action.payload);
        state.journeyError = null;
      })
      .addCase(fetchTodayJourney.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.journeyStatus = "failed";
          state.journeyError = action.payload;
        }
      })

      // ===== SAVE JOURNEY =====
      .addCase(saveJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(saveJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        journeysAdapter.upsertOne(state.journeys, action.payload);
        state.journeyError = null;
      })
      .addCase(saveJourney.rejected, (state, action) => {
        state.journeyStatus = "failed";
        state.journeyError = action.payload?.message || "Failed to save journey";
      })

      // ===== ADMIN JOURNEYS =====
      .addCase(fetchAllJourneys.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(fetchAllJourneys.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        journeysAdapter.setAll(state.adminJourneys, action.payload);
        state.adminError = null;
      })
      .addCase(fetchAllJourneys.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.adminStatus = "failed";
          state.adminError = action.payload;
        }
      })

      // ===== ADD JOURNEY =====
      .addCase(addJourney.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(addJourney.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        journeysAdapter.addOne(state.adminJourneys, action.payload);
        state.adminError = null;
      })
      .addCase(addJourney.rejected, (state, action) => {
        state.adminStatus = "failed";
        state.adminError = action.payload?.message || "Failed to add journey";
      })

      // ===== UPDATE JOURNEY =====
      .addCase(updateJourney.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(updateJourney.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        journeysAdapter.updateOne(state.adminJourneys, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.adminError = null;
      })
      .addCase(updateJourney.rejected, (state, action) => {
        state.adminStatus = "failed";
        state.adminError = action.payload?.message || "Failed to update journey";
      })

      // ===== DRIVERS =====
      .addCase(fetchAllDrivers.pending, (state) => {
        state.driversStatus = "loading";
        state.driversError = null;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.driversStatus = "succeeded";
        driversAdapter.setAll(state.drivers, action.payload);
        state.driversError = null;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        if (action.payload !== "Request cancelled") {
          state.driversStatus = "failed";
          state.driversError = action.payload;
        }
      });
  },
});

// ===== EXPORTS =====

export const {
  clearRoutesError,
  clearJourneyError,
  resetAllStatus,
  clearAllData,
} = journeySlice.actions;

// ✅ Selectors for routes
export const {
  selectAll: selectAllRoutes,
  selectById: selectRouteById,
  selectEntities: selectRouteEntities,
} = routesAdapter.getSelectors((state) => state.journey.routes);

// ✅ Selectors for admin journeys
export const {
  selectAll: selectAllAdminJourneys,
  selectById: selectAdminJourneyById,
  selectEntities: selectAdminJourneyEntities,
} = journeysAdapter.getSelectors((state) => state.journey.adminJourneys);

// ✅ Selectors for drivers
export const {
  selectAll: selectAllDrivers,
  selectById: selectDriverById,
  selectEntities: selectDriverEntities,
} = driversAdapter.getSelectors((state) => state.journey.drivers);

export default journeySlice.reducer;