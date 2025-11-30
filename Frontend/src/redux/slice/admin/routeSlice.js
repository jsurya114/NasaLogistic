import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// ✅ Entity Adapter for normalized state
const routesAdapter = createEntityAdapter({
  selectId: (route) => route.id,
  sortComparer: (a, b) => b.id - a.id,
});

// ===== ASYNC THUNKS =====

// Fetch all routes with pagination and search
export const fetchRoutes = createAsyncThunk(
  "routes/fetchRoutes",
  async ({ page, limit, search = "", signal }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/routes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        { credentials: "include", signal }
      );

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to fetch routes");
      }

      return await res.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Add a route
export const addRoute = createAsyncThunk(
  "routes/addRoute",
  async (routeData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to add route");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update a route
export const updateRoute = createAsyncThunk(
  "routes/updateRoute",
  async ({ id, routeData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to update route");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Toggle route status
export const toggleRouteStatus = createAsyncThunk(
  "routes/toggleRouteStatus",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/routes/${id}/status`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to toggle route status");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete a route
export const deleteRoute = createAsyncThunk(
  "routes/deleteRoute",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/routes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to delete route");
      }

      return { id };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// ===== SLICE =====

const routeSlice = createSlice({
  name: "routes",
  initialState: routesAdapter.getInitialState({
    currentPageIds: [],
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 4,
    status: "idle",
    error: null,
  }),

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRoutesState: (state) => {
      routesAdapter.removeAll(state);
      state.currentPageIds = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
      state.status = "idle";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ===== FETCH ROUTES =====
      .addCase(fetchRoutes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Upsert routes to normalized state
        routesAdapter.upsertMany(state, action.payload.routes || []);
        
        // ✅ Store only IDs for current page
        state.currentPageIds = (action.payload.routes || []).map(r => r.id);
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.page = action.payload.page || 1;
        state.error = null;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        if (action.payload !== 'Request cancelled') {
          state.status = "failed";
          state.error = action.payload;
        }
      })

      // ===== ADD ROUTE =====
      .addCase(addRoute.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addRoute.fulfilled, (state, action) => {
        state.status = "succeeded";
        // ✅ Add to entities but let refetch handle pagination
        routesAdapter.addOne(state, action.payload);
        state.error = null;
      })
      .addCase(addRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ===== UPDATE ROUTE =====
      .addCase(updateRoute.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateRoute.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Update in normalized state
        routesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.error = null;
      })
      .addCase(updateRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ===== TOGGLE ROUTE STATUS =====
      .addCase(toggleRouteStatus.pending, (state, action) => {
        // ✅ Optimistic update
        const id = action.meta.arg;
        const route = state.entities[id];
        
        if (route) {
          routesAdapter.updateOne(state, {
            id,
            changes: { enabled: !route.enabled },
          });
        }
      })
      .addCase(toggleRouteStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Confirm with server response
        routesAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
        state.error = null;
      })
      .addCase(toggleRouteStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        
        // ✅ Revert optimistic update
        const id = action.meta.arg;
        const route = state.entities[id];
        
        if (route) {
          routesAdapter.updateOne(state, {
            id,
            changes: { enabled: !route.enabled },
          });
        }
      })

      // ===== DELETE ROUTE =====
      .addCase(deleteRoute.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Remove from normalized state
        routesAdapter.removeOne(state, action.payload.id);
        
        // ✅ Remove from currentPageIds
        state.currentPageIds = state.currentPageIds.filter(id => id !== action.payload.id);
        
        // ✅ Update total count
        state.total = Math.max(0, state.total - 1);
        state.error = null;
      })
      .addCase(deleteRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// ===== EXPORTS =====

export const { clearError, resetRoutesState } = routeSlice.actions;

// ✅ Export entity adapter selectors
export const {
  selectAll: selectAllRoutes,
  selectById: selectRouteById,
  selectIds: selectRouteIds,
  selectEntities: selectRouteEntities,
} = routesAdapter.getSelectors((state) => state.routes);

// ✅ Custom selector for current page routes
export const selectCurrentPageRoutes = (state) => {
  const entities = state.routes.entities;
  return state.routes.currentPageIds.map(id => entities[id]).filter(Boolean);
};

export default routeSlice.reducer;