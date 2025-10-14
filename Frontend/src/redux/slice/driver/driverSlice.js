import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

const initialState = {
  driver: null,
  loading: false,
  error: null,
  isAuthenticated: false, // Changed from null to false for consistency
};

//  Optimized: Added better error handling and response validation
export const driverLogin = createAsyncThunk(
  "driver/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      //  Validate response structure
      if (!data.driver) {
        return rejectWithValue({ message: "Invalid response from server" });
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

//  Fixed: Removed unused __dirname parameter
export const accessDriver = createAsyncThunk(
  "driver/access-driver",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/access-driver`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        //  Return structured error for better handling
        return rejectWithValue({
          message: data.message || "Unable to get Driver",
          status: res.status,
        });
      }

      //  Validate response structure
      if (!data.driver) {
        return rejectWithValue({ message: "Invalid response from server" });
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

export const driverLogout = createAsyncThunk(
  "driver/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue({
          message: data.message || "Logout Error",
        });
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    //  Keep this for programmatic logout (e.g., token expiry)
    logout: (state) => {
      state.driver = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    //  New: Set driver directly (useful for optimistic updates)
    setDriver: (state, action) => {
      state.driver = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // ===== Driver Login =====
    builder
      .addCase(driverLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(driverLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.driver = action.payload.driver;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(driverLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.driver = null;
        
        //  Better error handling - check for validation errors
        if (action.payload?.errors) {
          // Validation errors (handled by form)
          state.error = null;
        } else {
          // General errors (show in toast/UI)
          state.error = action.payload?.message || "Login Failed";
        }
      })

      // ===== Driver Logout =====
      .addCase(driverLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(driverLogout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.driver = null;
        state.error = null;
      })
      .addCase(driverLogout.rejected, (state, action) => {
        state.loading = false;
        //  Even if logout fails, clear local state for security
        state.isAuthenticated = false;
        state.driver = null;
        state.error = action.payload?.message || "Logout failed";
      })

      // ===== Access Driver =====
      .addCase(accessDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(accessDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.driver = action.payload.driver;
        state.error = null;
      })
      .addCase(accessDriver.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.driver = null;
        
        //  Better unauthorized handling
        const isUnauthorized = action.payload?.status === 401 || 
                               action.payload === "UNAUTHORIZED";
        
        if (isUnauthorized) {
          // Silent failure for unauthorized (expected on initial load)
          state.error = null;
        } else {
          // Show error for other failures
          state.error = action.payload?.message || "Access denied";
        }
      });
  },
});

export const { clearError, logout, setDriver } = driverSlice.actions;
export default driverSlice.reducer;