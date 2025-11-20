import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config"



// Fetch all routes
export const fetchRoutes = createAsyncThunk("routes/fetchRoutes", async ({ page, limit,search="" }) => {
  try {
    console.log("Fetching routes from ",API_BASE_URL,"/admin/routes..."); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/routes?page=${page}&limit=${limit}&search=${search}`,
      { credentials: "include" }
    );

    console.log("Fetching routes from http://localhost:3251/admin/routes..."); // Debug log
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch routes");
    }
    const data = await res.json();
    console.log("Fetched routes:", data); // Debug log
    return data;
  } catch (error) {
    console.error("fetchRoutes error:", error.message); // Debug log
    throw error;
  }
});

// Add a route
export const addRoute = createAsyncThunk("routes/addRoute", async (routeData) => {
  try {
    console.log("Adding route:", routeData); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routeData),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to add route");
    }
    const data = await res.json();
    console.log("Added route:", data); // Debug log
    return data;
  } catch (error) {
    console.error("addRoute error:", error.message); // Debug log
    throw error;
  }
});

// Toggle route status
export const toggleRouteStatus = createAsyncThunk("routes/toggleRouteStatus", async (id) => {
  try {
    console.log(`Toggling status for route id: ${id}`); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/routes/${id}/status`, { method: "PATCH", credentials: "include" });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to toggle route status");
    }
    const data = await res.json();
    console.log("Toggled route:", data); // Debug log
    return data;
  } catch (error) {
    console.error("toggleRouteStatus error:", error.message); // Debug log
    throw error;
  }
});

// Delete a route
export const deleteRoute = createAsyncThunk("routes/deleteRoute", async (id) => {
  try {
    console.log(`Deleting route id: ${id}`); // Debug log
    const res = await fetch(`${API_BASE_URL}/admin/routes/${id}`, { method: "DELETE", credentials: "include" });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete route");
    }
    console.log("Deleted route id:", id); // Debug log
    return id;
  } catch (error) {
    console.error("deleteRoute error:", error.message); // Debug log
    throw error;
  }
});

export const updateRoute=createAsyncThunk("routes/updateRoute",async({id,routeData})=>{
  try {
    const res = await fetch(`${API_BASE_URL}/admin/routes/${id}`,{
      method:"PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routeData),
      credentials: "include",
    })

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update route");
    }
    const data = await res.json();
    console.log("Updated route:", data);
    return data;
  } catch (error) {
    console.error("updateRoute error:", error.message);
    throw error;
  }
})

const routeSlice = createSlice({
  name: "routes",
  initialState: {
    routes: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    page:1,
    total:0,
    totalPages:0,
    limit:4
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch routes
      .addCase(fetchRoutes.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("fetchRoutes: Status set to loading"); // Debug log
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = action.payload.routes;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        console.log("fetchRoutes: Routes state updated:", action.payload); // Debug log
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("fetchRoutes: Failed:", action.error.message); // Debug log
      })
      // Add route
      .addCase(addRoute.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("addRoute: Status set to loading"); // Debug log
      })
      .addCase(addRoute.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes.push(action.payload);
        console.log("addRoute: Route added:", action.payload); // Debug log
      })
      .addCase(addRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("addRoute: Failed:", action.error.message); // Debug log
      })
      //update Route
      .addCase(updateRoute.pending,(state)=>{
        state.status ="loading"
        state.error=null
         console.log("updateRoute: Status set to loading");
      })
      .addCase(updateRoute.fulfilled,(state,action)=>{
        state.status="succeeded"
        const index = state.routes.findIndex((r)=>r.id===action.payload.id)
        if(index!==-1){
          state.routes[index]=action.payload
           console.log("updateRoute: Route updated:", action.payload);
        }
      })
        .addCase(updateRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("updateRoute: Failed:", action.error.message);
      })
      // Toggle route status
      .addCase(toggleRouteStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("toggleRouteStatus: Status set to loading"); // Debug log
      })
      .addCase(toggleRouteStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.routes.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.routes[index] = action.payload;
          console.log("toggleRouteStatus: Route updated:", action.payload); // Debug log
        }
      })
      .addCase(toggleRouteStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("toggleRouteStatus: Failed:", action.error.message); // Debug log
      })
      // Delete route
      .addCase(deleteRoute.pending, (state) => {
        state.status = "loading";
        state.error = null;
        console.log("deleteRoute: Status set to loading"); // Debug log
      })
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = state.routes.filter((r) => r.id !== action.payload);
        console.log("deleteRoute: Route deleted:", action.payload); // Debug log
      })
      .addCase(deleteRoute.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        console.error("deleteRoute: Failed:", action.error.message); // Debug log
      });
  },
});

export default routeSlice.reducer