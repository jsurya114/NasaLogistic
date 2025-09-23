import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"



export const excelDailyFileUpload = createAsyncThunk(
    'admin/uploadExcel',
    async(formData,{rejectWithValue})=>{
        try {
            // const form = new FormData(fkr)
            // form.append('file',file)
            const res = await fetch('http://localhost:3251/admin/doubleStop/fileUpload',{
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


const excelSlice = createSlice({
  name: "excel",
  initialState: { loading: false, error: null, success: false },
  reducers: {},
  extraReducers: (builder) => {
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
  },
});

export default excelSlice.reducer;
