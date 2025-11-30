import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

const initialState = {
  admin: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ===== ASYNC THUNKS =====

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // ✅ Only once
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

export const accessAdminUser = createAsyncThunk(
  "admin/access-admin",
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/access-admin`, {
        method: "GET",
        credentials: "include",
        signal, // ✅ Request cancellation support
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Unable to get user");
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Logout error");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// ===== SLICE =====

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== LOGIN =====
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        // ✅ Simplified: Only set error if no field-level errors
        state.error = action.payload?.errors 
          ? null 
          : (action.payload?.message || "Login failed");
      })

      // ===== LOGOUT =====
      .addCase(adminLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.error = null;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      })

      // ===== ACCESS ADMIN USER =====
      .addCase(accessAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(accessAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.error = null;
      })
      .addCase(accessAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.admin = null;
        // ✅ Don't set error for request cancellation
        if (action.payload !== "Request cancelled") {
          state.error = action.payload || "Access denied";
        }
      });
  },
});

// ===== SELECTORS =====

// ✅ Memoized selector for isSuperAdmin
export const selectIsSuperAdmin = createSelector(
  [(state) => state.admin.admin],
  (admin) => admin?.role === "superadmin"
);

// ✅ Other useful selectors
export const selectAdmin = (state) => state.admin.admin;
export const selectIsAuthenticated = (state) => state.admin.isAuthenticated;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

// ===== EXPORTS =====

export const { clearError, clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;