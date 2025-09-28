import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";
// Fetch all routes
export const fetchRoutes = createAsyncThunk("routes/fetchRoutes", async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/routes`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch routes");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
});

export const fetchTodayJourney = createAsyncThunk(
    "journeys/fetchTodayJourney",
    async(driver_id)=>{
        try {
            const res = await fetch(`${API_BASE_URL}/driver/journey/${driver_id}`)
            if(!res.ok){
                const error = await res.json()
                throw new Error(error.message||"Failed to fetch journey")
            }
            const data  = await res.json()
            return data.data
        } catch (error) {
            throw error
        }
    }
)

export const saveJourney = createAsyncThunk(
     "journeys/saveJourney",
     async(journeyData,{rejectWithValue})=>{
        try {
            const res = await fetch(`${API_BASE_URL}/driver/journey`,{
                method:"POST",
                headers: { "Content-Type": "application/json" },
                body:JSON.stringify(journeyData)
              })
              const data  = await res.json()
            if(!res.ok){
               return rejectWithValue(data)
            }
            return data.data
        } catch (error) {
            return rejectWithValue({ message: error.message })
        }
     }
)

const journeySlice = createSlice({
 name: "journey",
  initialState: {
    routes: [],
    routesStatus: "idle",
    routesError: null,
    journeys: [],
    journeyStatus: "idle",
    journeyError: null,
  },
  reducers: {
     clearRoutesError(state) {
      state.routesError = null;
    },
    clearJourneyError(state) {
      state.journeyError = null;
    },
    resetRoutesStatus(state) {
      state.routesStatus = "idle";
    },
    resetJourneyStatus(state) {
      state.journeyStatus = "idle";
    },
    updateRouteLocally(state, action) {
      const index = state.routes.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.routes[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Routes
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.routesStatus = "loading";
        state.routesError = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routesStatus = "succeeded";
        state.routes = action.payload;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.routesStatus = "failed";
        state.routesError = action.error.message;
      });

    // Journeys
    builder
      .addCase(fetchTodayJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(fetchTodayJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        state.journeys = action.payload;
      })
      .addCase(fetchTodayJourney.rejected, (state, action) => {
        state.journeyStatus = "failed";
        state.journeyError = action.error.message;
      })
      .addCase(saveJourney.pending, (state) => {
        state.journeyStatus = "loading";
        state.journeyError = null;
      })
      .addCase(saveJourney.fulfilled, (state, action) => {
        state.journeyStatus = "succeeded";
        state.journeys.push(action.payload); // Add newly saved journey
      })
      .addCase(saveJourney.rejected, (state, action) => {
        state.journeyStatus = "failed";
        state.journeyError = action.payload?.message
      });
  },
});

export const {
  clearRoutesError,
  clearJourneyError,
  resetRoutesStatus,
  resetJourneyStatus,
} = journeySlice.actions;

export default journeySlice.reducer;