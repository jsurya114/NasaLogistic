import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch all routes for access codes
export const fetchAccessCodeRoutes = createAsyncThunk(
  "driverAccessCodes/fetchAccessCodeRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/access-codes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch paginated access codes
export const fetchAccessCodes = createAsyncThunk(
  "driverAccessCodes/fetchAccessCodes",
  async ({ page = 1, limit = 10, search = '', routeFilter = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(routeFilter && { route_id: routeFilter })
      });

      const res = await fetch(`${API_BASE_URL}/driver/access-codes/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create an access code
export const createAccessCode = createAsyncThunk(
  "driverAccessCodes/createAccessCode",
  async (accessCodeData, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/access-codes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accessCodeData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}: Failed to create access code`);
      }
      
      const data = await res.json();
      
      // Refetch with current pagination settings
      const { currentPage, pageLimit, searchTerm, routeFilter } = getState().driverAccessCodes;
      dispatch(fetchAccessCodes({ 
        page: currentPage, 
        limit: pageLimit, 
        search: searchTerm, 
        routeFilter 
      }));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const driverAccessCodeSlice = createSlice({
  name: "driverAccessCodes",
  initialState: {
    routes: [],
    accessCodes: [],
    status: "idle",
    error: null,
    currentPage: 1,
    pageLimit: 10,
    totalPages: 0,
    totalItems: 0,
    hasMore: false,
    searchTerm: '',
    routeFilter: '',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageLimit: (state, action) => {
      state.pageLimit = action.payload;
      state.currentPage = 1;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setRouteFilter: (state, action) => {
      state.routeFilter = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch routes
      .addCase(fetchAccessCodeRoutes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccessCodeRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAccessCodeRoutes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to fetch routes";
        state.routes = [];
      })
      // Fetch access codes
      .addCase(fetchAccessCodes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccessCodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessCodes = action.payload.data || [];
        state.totalPages = action.payload.pagination?.totalPages || 0;
        state.totalItems = action.payload.pagination?.total || 0;
        state.hasMore = action.payload.pagination?.hasMore || false;
        state.error = null;
      })
      .addCase(fetchAccessCodes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to fetch access codes";
      })
      // Create access code
      .addCase(createAccessCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAccessCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createAccessCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to create access code";
      });
  },
});

export const { clearError, resetStatus, setPage, setPageLimit, setSearchTerm, setRouteFilter } = driverAccessCodeSlice.actions;
export default driverAccessCodeSlice.reducer;