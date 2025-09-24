import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";

const initialState={
    driver:null,
    loading:false,
    error:null,
    isAuthenticated:false
}
export const driverLogin=createAsyncThunk(
    "driver/login",
   async(credentials,{rejectWithValue})=>{
    try {
        const res = await fetch("http://localhost:3251/driver/login",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(credentials),
                credentials:"include"
        })
        const data = await res.json()
        if(!res.ok){
                return rejectWithValue(data.message||"Login failed")
            }
            return data
    } catch (error) {
            return rejectWithValue(error.message)
        }
   }
)
const driverSlice = createSlice({
    name:"driver",
    initialState,
    reducers:{
        clearError:(state)=>{
            state.error=null
        },
        logout:(state)=>{
            state.driver=null
            state.isAuthenticated=false
        }
    },
    extraReducers:(builders)=>{
     builders
     .addCase(driverLogin.pending,(state)=>{
        state.loading=true
        state.error=null
     })
     .addCase(driverLogin.fulfilled,(state,action)=>{
        state.loading=false
        state.driver=action.payload.driver
        state.isAuthenticated=true
     })
     .addCase(driverLogin.rejected,(state,action)=>{
        state.loading=false
        state.error=action.payload||"Login Failed"
        state.isAuthenticated=false
     })
    }
})

export const {clearError,logout}=driverSlice.actions
export default driverSlice.reducer