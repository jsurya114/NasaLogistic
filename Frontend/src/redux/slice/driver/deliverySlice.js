import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch deliveries for driver (can include from_date/to_date later)
export const fetchDeliverySummary = createAsyncThunk(
  "delivery/fetchDeliverySummary",
  async ({ driverId, from_date, to_date }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/driver/deliveries/${driverId}?from_date=${from_date}&to_date=${to_date}`,{
            credentials:"include"
        }
      );
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      const data = await res.json();

      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message || "Error fetching deliveries");
    }
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    deliveries: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearDeliveryError: (state) => {
      state.error = null;
    },
    resetDeliveries:(state)=>{
        state.deliveries=[]
        state.status="idle"
        state.error=null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliverySummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDeliverySummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deliveries = action.payload;
      })
      .addCase(fetchDeliverySummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearDeliveryError ,resetDeliveries} = deliverySlice.actions;
export default deliverySlice.reducer;
