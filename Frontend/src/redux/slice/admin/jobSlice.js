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

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    cities: [],
    total: 0,
    totalPages: 0,
    page: 1,
    status: "idle", // idle | loading | succeeded | failed
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
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
      state.status = "idle";
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
      })
      .addCase(jobStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update with server response to ensure consistency
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
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
      });
  },
});

export const { clearError, resetJobsState } = jobSlice.actions;
export default jobSlice.reducer;