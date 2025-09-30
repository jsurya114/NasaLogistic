


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch all jobs
export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async () => {
  try {
    // console.log("Fetching jobs from http://localhost:3251/admin/jobs..."); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/jobs`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch jobs");
    }
    const data = await res.json();
    console.log("Fetched jobs:", data); // Debug log
    return data;
  } catch (error) {
    console.error("fetchJobs error:", error.message); // Debug log
    throw error;
  }
});

// Add a job
export const addJob = createAsyncThunk("jobs/addJob", async ({ job, city_code, enabled }) => {
  try {
    console.log("Adding job:", { job, city_code, enabled }); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/addjob`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, city_code, enabled }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to add job");
    }
    const data = await res.json();
    console.log("Added job:", data); // Debug log
    return data;
  } catch (error) {
    console.error("addJob error:", error.message); // Debug log
    throw error;
  }
});

// Update a job
export const updateJob = createAsyncThunk("jobs/updateJob", async ({ id, job, city_code }) => {
  try {
    console.log(`Updating job id: ${id} with:`, { job, city_code }); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/updatejob/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, city_code }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update job");
    }
    const data = await res.json();
    console.log("Updated job:", data); // Debug log
    return data;
  } catch (error) {
    console.error("updateJob error:", error.message); // Debug log
    throw error;
  }
});

// Delete a job
export const deleteJob = createAsyncThunk("jobs/deleteJob", async (id) => {
  try {
    console.log(`Deleting job id: ${id}`); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/deletejob/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete job");
    }
    console.log("Deleted job id:", id); // Debug log
    return id;
  } catch (error) {
    console.error("deleteJob error:", error.message); // Debug log
    throw error;
  }
});

// Toggle job status
export const jobStatus = createAsyncThunk("jobs/jobStatus", async (id) => {
  try {
    console.log(`Toggling status for job id: ${id}`); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/${id}/status`, { method: "PATCH" });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to toggle job status");
    }
    const data = await res.json();
    console.log("Toggled job:", data); // Debug log
    return data;
  } catch (error) {
    console.error("jobStatus error:", error.message); // Debug log
    throw error;
  }
});
export const fetchPaginatedJobs = createAsyncThunk(
  "jobs/fetchPaginated",
  async ({ page, limit ,search =""}) => {
    const res = await fetch(`http://localhost:3251/admin/jobs?page=${page}&limit=${limit}&search=${search}`);
    if(!res.ok){
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch jobs");
    }
    const data = await res.json();
    return data;
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    cities: [],
    total:0,
    totalPages:0,
    page:1,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("fetchJobs: Status set to loading"); // Debug log
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
       state.cities = action.payload.jobs || action.payload || [];
        console.log("fetchJobs: Cities state updated:", action.payload); // Debug log
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("fetchJobs: Failed:", action.error.message); // Debug log
      })
      // Add job
      .addCase(addJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("addJob: Status set to loading"); // Debug log
      })
      .addCase(addJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities.push(action.payload);
        console.log("addJob: Job added:", action.payload); // Debug log
      })
      .addCase(addJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("addJob: Failed:", action.error.message); // Debug log
      })
      // Update job
      .addCase(updateJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("updateJob: Status set to loading"); // Debug log
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
          console.log("updateJob: Job updated:", action.payload); // Debug log
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("updateJob: Failed:", action.error.message); // Debug log
      })
      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("deleteJob: Status set to loading"); // Debug log
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = state.cities.filter((c) => c.id !== action.payload);
        console.log("deleteJob: Job deleted:", action.payload); // Debug log
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("deleteJob: Failed:", action.error.message); // Debug log
      })
      // Toggle job status
      .addCase(jobStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("jobStatus: Status set to loading"); // Debug log
      })
      .addCase(jobStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.cities.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cities[index] = action.payload;
          console.log("jobStatus: Job updated:", action.payload); // Debug log
        }
      })
      .addCase(jobStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("jobStatus: Failed:", action.error.message); // Debug log
      })
      .addCase(fetchPaginatedJobs.pending,(state)=>{
        state.status="loading"
        state.error=null
      })
      .addCase(fetchPaginatedJobs.fulfilled,(state,action)=>{
        state.status="succeeded"
        state.cities=action.payload.jobs 
        state.total=action.payload.total
        state.totalPages=action.payload.totalPages
        state.page=action.payload.page
      })
      .addCase(fetchPaginatedJobs.rejected,(state,action)=>{
        state.status="failed"
        state.error=action.error.message
      })
  },
});

export default jobSlice.reducer;