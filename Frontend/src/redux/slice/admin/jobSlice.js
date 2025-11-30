import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch paginated jobs with search and request cancellation support
export const fetchPaginatedJobs = createAsyncThunk(
  "jobs/fetchPaginated",
  async ({ page, limit, search = "", status = "all" }, { signal, rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
        { signal, credentials: "include" }
      );

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to fetch jobs");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request cancelled');
      }
      console.error("fetchPaginatedJobs error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all jobs (keep for backwards compatibility if needed elsewhere)
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/jobs`, { credentials: "include" });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to fetch jobs");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("fetchJobs error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Add a job
export const addJob = createAsyncThunk(
  "jobs/addJob",
  async ({ job, city_code, enabled }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/addjob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, city_code, enabled }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to add job");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("addJob error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Update a job
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, job, city_code }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/updatejob/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, city_code }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to update job");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("updateJob error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Delete a job
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/deletejob/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to delete job");
      }

      return id;
    } catch (error) {
      console.error("deleteJob error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Toggle job status - optimistic update support
export const jobStatus = createAsyncThunk(
  "jobs/jobStatus",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/${id}/status`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to toggle job status");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("jobStatus error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);
export const fetchAllCities = createAsyncThunk(
  "jobs/fetchAllCities",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all enabled cities...");
      const res = await fetch(`${API_BASE_URL}/admin/get-cities`, {
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to fetch all cities");
      }

      const data = await res.json();
      console.log("Fetched all cities:", data.cities);
      return data.cities;
    } catch (error) {
      console.error("fetchAllCities error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    cities: [],           // For paginated jobs management
    allCities: [],        // NEW: For dropdowns - all enabled cities
    total: 0,
    totalPages: 0,
    page: 1,
    status: "idle",       // idle | loading | succeeded | failed
    allCitiesStatus: "idle", // NEW: Separate status for all cities
    error: null,
  },
  reducers: {
    // Reset error state
    clearError: (state) => {
      state.error = null;
    },
    // Reset to initial state
    resetJobsState: (state) => {
      state.cities = [];
      state.allCities = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
      state.status = "idle";
      state.allCitiesStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch paginated jobs
      .addCase(fetchPaginatedJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaginatedJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload.jobs || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.page = action.payload.page || 1;
        state.error = null;
      })
      .addCase(fetchPaginatedJobs.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== 'Request cancelled') {
          state.status = "failed";
          state.error = action.payload || action.error.message;
        }
      })

      // NEW: Fetch all enabled cities
      .addCase(fetchAllCities.pending, (state) => {
        state.allCitiesStatus = "loading";
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.allCitiesStatus = "succeeded";
        state.allCities = action.payload || [];
        console.log("fetchAllCities: All cities updated:", action.payload);
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.allCitiesStatus = "failed";
        state.error = action.payload || action.error.message;
        console.error("fetchAllCities: Failed:", action.payload);
      })

      // Fetch all jobs
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload.jobs || action.payload || [];
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Add job - don't update local state, let refetch handle it
      .addCase(addJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addJob.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
        // Don't push to cities array - pagination will be handled by refetch
      })
      .addCase(addJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Update job - optimistic update
      .addCase(updateJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
        }
        // Also update in allCities if it exists there
        const allIndex = state.allCities.findIndex((c) => c.id === action.payload.id);
        if (allIndex !== -1) {
          state.allCities[allIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Delete job - optimistic update
      .addCase(deleteJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = state.cities.filter((c) => c.id !== action.payload);
        // Also remove from allCities
        state.allCities = state.allCities.filter((c) => c.id !== action.payload);
        // Decrement total count
        state.total = Math.max(0, state.total - 1);
        state.error = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Toggle job status - optimistic update
      .addCase(jobStatus.pending, (state, action) => {
        // Optimistic update for better UX
        const id = action.meta.arg;
        const index = state.cities.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.cities[index].enabled = !state.cities[index].enabled;
        }
        // Also update in allCities
        const allIndex = state.allCities.findIndex((c) => c.id === id);
        if (allIndex !== -1) {
          // If disabling, remove from allCities (since it only shows enabled)
          if (state.allCities[allIndex].enabled) {
            state.allCities = state.allCities.filter((c) => c.id !== id);
          }
        }
      })
      .addCase(jobStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update with server response to ensure consistency
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
        }
        // Update allCities: remove if disabled, add if enabled
        const allIndex = state.allCities.findIndex((c) => c.id === action.payload.id);
        if (action.payload.enabled) {
          if (allIndex === -1) {
            // Add to allCities if it was just enabled
            state.allCities.push(action.payload);
          } else {
            // Update existing
            state.allCities[allIndex] = action.payload;
          }
        } else {
          // Remove from allCities if disabled
          state.allCities = state.allCities.filter((c) => c.id !== action.payload.id);
        }
        state.error = null;
      })
      .addCase(jobStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        // Revert optimistic update on error
        const id = action.meta.arg;
        const index = state.cities.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.cities[index].enabled = !state.cities[index].enabled;
        }
        // Revert allCities change
        // This is tricky - we'd need to refetch to be safe
        // For now, just refetch allCities on error
      });
  },
});

export const { clearError, resetJobsState } = jobSlice.actions;
export default jobSlice.reducer;