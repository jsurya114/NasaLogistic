import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import { API_BASE_URL } from "../../../config"

export const excelDailyFileUpload = createAsyncThunk(
    'admin/uploadExcel',
    async(formData,{rejectWithValue})=>{
        try {
            // const form = new FormData(fkr)
            // form.append('file',file)
            const res = await fetch(`${API_BASE_URL}/admin/doubleStop/dailyFileUpload`,{
                method:'POST',
                body:formData,
            })
            const data = await res.json()
            console.log(data,'excel file upload staus')
            if(!res.ok){
                return rejectWithValue(data.message || 'Excel file upload failed')
            }
            return data
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// Async thunk for weekly file upload
export const excelWeeklyFileUpload = createAsyncThunk(
  "excel/uploadWeekly",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("File from React ",formData);
      const res = await fetch(`${API_BASE_URL}/admin/doubleStop/weekly-upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Weekly upload failed");
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);




const excelSlice = createSlice({
  name: "excel",
  initialState: {  weekly: {
      loading: false,
      success: false,
      error: null,
      data: null,
    },
    daily: {
      loading: false,
      success: false,
      error: null,
      data: null,
    }
  },
  reducers: {
      clearWeeklyState: (state) => {
      state.weekly = { loading: false, success: false, error: null, data: null };
    },
    clearDailyState: (state) => {
      state.daily = { loading: false, success: false, error: null, data: null };
    },
  },
  extraReducers: (builder) => {
    // Daily Upload
    builder
      .addCase(excelDailyFileUpload.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(excelDailyFileUpload.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(excelDailyFileUpload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Upload failed";
      });

      // Weekly Upload
    builder
      .addCase(excelWeeklyFileUpload.pending, (state) => {
        state.weekly.loading = true;
        state.weekly.error = null;
        state.weekly.success = false;
      })
      .addCase(excelWeeklyFileUpload.fulfilled, (state, action) => {
        state.weekly.loading = false;
        state.weekly.success = true;
        state.weekly.data = action.payload;
      })
      .addCase(excelWeeklyFileUpload.rejected, (state, action) => {
        state.weekly.loading = false;
        state.weekly.error = action.payload || "Something went wrong";
      });

  },
});


export const {clearDailyState,clearWeeklyState} = excelSlice.actions
export default excelSlice.reducer;
