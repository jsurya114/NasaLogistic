import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

// Fetch paginated access codes
export const fetchAccessCodes = createAsyncThunk(
  "accessCodes/fetchAccessCodes",
  async ({ page = 1, limit = 10, search = '', zipCodeFilter = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(zipCodeFilter && { zip_code: zipCodeFilter })
      });

      const res = await fetch(`${API_BASE_URL}/admin/access-codes/list?${params}`, {
        method: 'GET',
        credentials:'include',
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
  async (accessCodeData, { rejectWithValue, dispatch, getState }) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && accessCodeData instanceof FormData;
      const res = await fetch(`${API_BASE_URL}/admin/access-codes`, {
        method: "POST",
        credentials:'include',
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? accessCodeData : JSON.stringify(accessCodeData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}: Failed to create access code`);
      }
      
      const data = await res.json();
      
      // Refetch with current pagination settings
      const { currentPage, pageLimit, searchTerm, zipCodeFilter } = getState().accessCodes;
      dispatch(fetchAccessCodes({ 
        page: currentPage, 
        limit: pageLimit, 
        search: searchTerm, 
        zipCodeFilter 
      }));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an access code
export const updateAccessCode = createAsyncThunk(
  "accessCodes/updateAccessCode",
  async (payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
      const id = isFormData ? payload.get('id') : payload.id;
      if (!id) throw new Error('Missing id for updating access code');

      const res = await fetch(`${API_BASE_URL}/admin/access-codes/${id}`, {
        method: "PUT",
        credentials:'include',
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify({
          zip_code: payload.zip_code,
          address: payload.address,
          access_code: payload.access_code,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}: Failed to update access code`);
      }
      
      const data = await res.json();
      
      // Refetch with current pagination settings
      const { currentPage, pageLimit, searchTerm, zipCodeFilter } = getState().accessCodes;
      dispatch(fetchAccessCodes({ 
        page: currentPage, 
        limit: pageLimit, 
        search: searchTerm, 
        zipCodeFilter 
      }));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete an access code
export const deleteAccessCode = createAsyncThunk(
  "accessCodes/deleteAccessCode",
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/access-codes/${id}`, {
        method: "DELETE",
        credentials:'include',
        headers: { 
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `HTTP ${res.status}: Failed to delete access code`);
      }
      
      // Refetch with current pagination settings
      const { currentPage, pageLimit, searchTerm, zipCodeFilter } = getState().accessCodes;
      dispatch(fetchAccessCodes({ 
        page: currentPage, 
        limit: pageLimit, 
        search: searchTerm, 
        zipCodeFilter 
      }));
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const accessCodeSlice = createSlice({
  name: "accessCodes",
  initialState: {
    accessCodes: [],
    status: "idle",
    error: null,
    currentPage: 1,
    pageLimit: 10,
    totalPages: 0,
    totalItems: 0,
    hasMore: false,
    searchTerm: '',
    zipCodeFilter: '',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageLimit: (state, action) => {
      state.pageLimit = action.payload;
      state.currentPage = 1;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setZipCodeFilter: (state, action) => {
      state.zipCodeFilter = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch access codes
      .addCase(fetchAccessCodes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccessCodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessCodes = action.payload.data || [];
        state.totalPages = action.payload.pagination?.totalPages || 0;
        state.totalItems = action.payload.pagination?.total || 0;
        state.hasMore = action.payload.pagination?.hasMore || false;
        state.error = null;
      })
      .addCase(fetchAccessCodes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to fetch access codes";
      })
      // Create access code
      .addCase(createAccessCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAccessCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createAccessCode.rejected, (state, action) => {
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
      })
      // Delete access code
      .addCase(deleteAccessCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteAccessCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(deleteAccessCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to delete access code";
      });
  },
});

export const { clearError, resetStatus, setPage, setPageLimit, setSearchTerm, setZipCodeFilter } = accessCodeSlice.actions;
export default accessCodeSlice.reducer;