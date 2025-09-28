import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all routes for access codes
export const fetchAccessCodeRoutes = createAsyncThunk(
  "accessCodes/fetchAccessCodeRoutes",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Starting fetchAccessCodeRoutes..."); // Debug log
      console.log("🌐 Fetching from: http://localhost:3251/admin/access-codes"); // Debug log
      
      const res = await fetch("http://localhost:3251/admin/access-codes", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("📡 Response status:", res.status); // Debug log
      console.log("📡 Response ok:", res.ok); // Debug log
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Response not ok:", errorText); // Debug log
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("✅ Fetched routes data:", data); // Debug log
      console.log("✅ Data type:", typeof data); // Debug log
      console.log("✅ Data is array:", Array.isArray(data)); // Debug log
      
      // Ensure we return an array
      if (!Array.isArray(data)) {
        console.warn("⚠️ Data is not an array, converting..."); // Debug log
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("💥 fetchAccessCodeRoutes error:", error); // Debug log
      console.error("💥 Error message:", error.message); // Debug log
      console.error("💥 Error stack:", error.stack); // Debug log
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all access codes
export const fetchAccessCodes = createAsyncThunk(
  "accessCodes/fetchAccessCodes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:3251/admin/access-codes/list", {
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
  "accessCodes/createAccessCode",
  async (accessCodeData, { rejectWithValue, dispatch }) => {
    try {
      console.log("🔄 Creating access code with data:", accessCodeData); // Debug log
      
      const res = await fetch("http://localhost:3251/admin/access-codes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accessCodeData),
      });
      
      console.log("📡 Create response status:", res.status); // Debug log
      
      if (!res.ok) {
        const error = await res.json();
        console.error("❌ Create response not ok:", error); // Debug log
        throw new Error(error.message || `HTTP ${res.status}: Failed to create access code`);
      }
      
      const data = await res.json();
      console.log("✅ Created access code response:", data); // Debug log
      dispatch(fetchAccessCodes()); // Refetch to update list
      return data.data; // Return the new access code data
    } catch (error) {
      console.error("💥 createAccessCode error:", error); // Debug log
      return rejectWithValue(error.message);
    }
  }
);

// Update an access code
export const updateAccessCode = createAsyncThunk(
  "accessCodes/updateAccessCode",
  async ({ id, route_id, address, access_code }, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`http://localhost:3251/admin/access-codes/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ route_id, address, access_code }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}: Failed to update access code`);
      }
      
      const data = await res.json();
      dispatch(fetchAccessCodes()); // Refetch to update list
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const accessCodeSlice = createSlice({
  name: "accessCodes",
  initialState: {
    routes: [], // Store the list of routes for the dropdown
    accessCodes: [], // Store the list of created access codes
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch routes
      .addCase(fetchAccessCodeRoutes.pending, (state) => {
        console.log("🔄 fetchAccessCodeRoutes.pending - Setting status to loading"); // Debug log
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccessCodeRoutes.fulfilled, (state, action) => {
        console.log("✅ fetchAccessCodeRoutes.fulfilled - Routes received:", action.payload); // Debug log
        state.status = "succeeded";
        state.routes = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAccessCodeRoutes.rejected, (state, action) => {
        console.error("❌ fetchAccessCodeRoutes.rejected:", action.payload); // Debug log
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
        state.accessCodes = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAccessCodes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to fetch access codes";
      })
      // Create access code
      .addCase(createAccessCode.pending, (state) => {
        console.log("🔄 createAccessCode.pending"); // Debug log
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAccessCode.fulfilled, (state, action) => {
        console.log("✅ createAccessCode.fulfilled:", action.payload); // Debug log
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createAccessCode.rejected, (state, action) => {
        console.error("❌ createAccessCode.rejected:", action.payload); // Debug log
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to create access code";
      })
      // Update access code
      .addCase(updateAccessCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAccessCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(updateAccessCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to update access code";
      });
  },
});

export const { clearError, resetStatus } = accessCodeSlice.actions;
export default accessCodeSlice.reducer;