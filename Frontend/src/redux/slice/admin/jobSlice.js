import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// ✅ Entity Adapter for normalized state (O(1) lookups)
const jobsAdapter = createEntityAdapter({
  selectId: (job) => job.id,
  sortComparer: (a, b) => b.id - a.id, // Sort by ID descending
});

// ===== ASYNC THUNKS =====

// Fetch paginated jobs with search and request cancellation support
export const fetchPaginatedJobs = createAsyncThunk(
  "jobs/fetchPaginated",
  async ({ page, limit, search = "", status = "all", signal }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
        { signal, credentials: "include" }
      );

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to fetch jobs");
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

// Fetch all enabled cities for dropdowns
export const fetchAllCities = createAsyncThunk(
  "jobs/fetchAllCities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/get-cities`, {
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Failed to fetch all cities");
      }

      const data = await res.json();
      return data.cities || [];
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
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

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update a job
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, job, city_code, enabled }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/updatejob/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, city_code, enabled }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.error || "Failed to update job");
      }

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
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

      return { id }; // Return ID for deletion
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Toggle job status
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

      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// ===== SLICE =====

const jobSlice = createSlice({
  name: "jobs",
  initialState: jobsAdapter.getInitialState({
    // Pagination data
    currentPageIds: [],    // IDs for current page only
    allCities: [],         // All enabled cities for dropdowns
    total: 0,
    totalPages: 0,
    page: 1,
    
    // Loading states
    status: "idle",        // idle | loading | succeeded | failed
    allCitiesStatus: "idle",
    
    // Error handling
    error: null,
  }),
  
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset to initial state
    resetJobsState: (state) => {
      jobsAdapter.removeAll(state);
      state.currentPageIds = [];
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
      // ===== FETCH PAGINATED JOBS =====
      .addCase(fetchPaginatedJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaginatedJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Use adapter to add/update jobs (normalized state)
        jobsAdapter.upsertMany(state, action.payload.jobs || []);
        
        // ✅ Store only IDs for current page
        state.currentPageIds = (action.payload.jobs || []).map(j => j.id);
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.page = action.payload.page || 1;
        state.error = null;
      })
      .addCase(fetchPaginatedJobs.rejected, (state, action) => {
        // Don't set error state for cancelled requests
        if (action.payload !== 'Request cancelled') {
          state.status = "failed";
          state.error = action.payload;
        }
      })

      // ===== FETCH ALL CITIES =====
      .addCase(fetchAllCities.pending, (state) => {
        state.allCitiesStatus = "loading";
      })
      .addCase(fetchAllCities.fulfilled, (state, action) => {
        state.allCitiesStatus = "succeeded";
        state.allCities = action.payload;
      })
      .addCase(fetchAllCities.rejected, (state, action) => {
        state.allCitiesStatus = "failed";
        state.error = action.payload;
      })

      // ===== ADD JOB =====
      .addCase(addJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        // ✅ Add to entities but don't modify currentPageIds
        // Component will refetch to get proper pagination
        jobsAdapter.addOne(state, action.payload);
        
        // ✅ If enabled, add to allCities
        if (action.payload.enabled) {
          state.allCities.push(action.payload);
        }
      })
      .addCase(addJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ===== UPDATE JOB =====
      .addCase(updateJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Update in normalized entities
        jobsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload
        });
        
        // ✅ Update in allCities
        const allIndex = state.allCities.findIndex(c => c.id === action.payload.id);
        if (action.payload.enabled) {
          if (allIndex === -1) {
            state.allCities.push(action.payload);
          } else {
            state.allCities[allIndex] = action.payload;
          }
        } else if (allIndex !== -1) {
          state.allCities.splice(allIndex, 1);
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ===== DELETE JOB =====
      .addCase(deleteJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Remove from normalized entities
        jobsAdapter.removeOne(state, action.payload.id);
        
        // ✅ Remove from currentPageIds
        state.currentPageIds = state.currentPageIds.filter(id => id !== action.payload.id);
        
        // ✅ Remove from allCities
        state.allCities = state.allCities.filter(c => c.id !== action.payload.id);
        
        // ✅ Update total count
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ===== TOGGLE JOB STATUS =====
      .addCase(jobStatus.pending, (state, action) => {
        // ✅ Optimistic update for better UX
        const id = action.meta.arg;
        const job = state.entities[id];
        
        if (job) {
          jobsAdapter.updateOne(state, {
            id,
            changes: { enabled: !job.enabled }
          });
          
          // ✅ Update allCities optimistically
          const allIndex = state.allCities.findIndex(c => c.id === id);
          if (job.enabled && allIndex !== -1) {
            // Disabling - remove from allCities
            state.allCities.splice(allIndex, 1);
          } else if (!job.enabled && allIndex === -1) {
            // Enabling - add to allCities
            state.allCities.push({ ...job, enabled: true });
          }
        }
      })
      .addCase(jobStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        // ✅ Confirm with server response
        jobsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload
        });
        
        // ✅ Sync allCities with server response
        const allIndex = state.allCities.findIndex(c => c.id === action.payload.id);
        if (action.payload.enabled) {
          if (allIndex === -1) {
            state.allCities.push(action.payload);
          } else {
            state.allCities[allIndex] = action.payload;
          }
        } else if (allIndex !== -1) {
          state.allCities.splice(allIndex, 1);
        }
      })
      .addCase(jobStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        
        // ✅ Revert optimistic update
        const id = action.meta.arg;
        const job = state.entities[id];
        
        if (job) {
          jobsAdapter.updateOne(state, {
            id,
            changes: { enabled: !job.enabled }
          });
          
          // ✅ Revert allCities change
          const allIndex = state.allCities.findIndex(c => c.id === id);
          if (!job.enabled && allIndex !== -1) {
            state.allCities.splice(allIndex, 1);
          } else if (job.enabled && allIndex === -1) {
            state.allCities.push(job);
          }
        }
      });
  },
});

// ===== EXPORTS =====

export const { clearError, resetJobsState } = jobSlice.actions;

// ✅ Export entity adapter selectors
export const {
  selectAll: selectAllJobs,
  selectById: selectJobById,
  selectIds: selectJobIds,
  selectEntities: selectJobEntities,
  selectTotal: selectTotalJobs,
} = jobsAdapter.getSelectors((state) => state.jobs);

// ✅ Custom selector for current page jobs only
export const selectCurrentPageJobs = (state) => {
  const entities = state.jobs.entities;
  return state.jobs.currentPageIds.map(id => entities[id]).filter(Boolean);
};

export default jobSlice.reducer;