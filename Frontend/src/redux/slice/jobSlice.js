import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all jobs
export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async () => {
  const res = await fetch("http://localhost:3251/admin/jobs");
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
});

// Add a job
export const addJob = createAsyncThunk("jobs/addJob", async ({ job, city_code, enabled }) => {
    console.log(job,city_code)
  const res = await fetch("http://localhost:3251/admin/addjob", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job, city_code, enabled }),
  });
  if (!res.ok) throw new Error("Failed to add job");
  return res.json();
});

// Update a job
export const updateJob = createAsyncThunk("jobs/updateJob", async ({ id, job, city_code }) => {
  const res = await fetch(`http://localhost:3251/admin/updatejob/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job, city_code }),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
});

// Delete a job
export const deleteJob = createAsyncThunk("jobs/deleteJob", async (id) => {
  const res = await fetch(`http://localhost:3251/admin/deletejob/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete job");
  return id;
});

// Toggle job status
export const jobStatus = createAsyncThunk("jobs/jobStatus", async (id) => {
  const res = await fetch(`http://localhost:3251/admin/${id}/status`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle job status");
  return res.json();
});

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    cities: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Add job
      .addCase(addJob.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(addJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities.push(action.payload);
      })
      .addCase(addJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Update job
      .addCase(updateJob.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.cities.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.cities[index] = action.payload;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Delete job
      .addCase(deleteJob.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = state.cities.filter(c => c.id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Toggle job status
      .addCase(jobStatus.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(jobStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.cities.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.cities[index] = action.payload;
      })
      .addCase(jobStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default jobSlice.reducer;
