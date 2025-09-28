import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

const initialState={
    driver:null,
    loading:false,
    error:null,
    isAuthenticated:null
}
export const driverLogin=createAsyncThunk(
    "driver/login",
   async(credentials,{rejectWithValue})=>{
    try {
        const res = await fetch(`${API_BASE_URL}/driver/login`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(credentials),
                credentials:"include"
                
        })
        const data = await res.json()
        console.log(data)
        console.log(credentials)
        if(!res.ok){
                return rejectWithValue(data)
            }
            return data
    } catch (error) {
            return rejectWithValue(error.message)
        }
   }
)
export const accessDriver=createAsyncThunk(
    "driver/access-driver",
    async(__dirname,{rejectWithValue})=>{
        try {
            const res = await fetch(`${API_BASE_URL}/driver/access-driver`,{
                method:"GET",
                credentials:"include"  
            })
            const data = await res.json()
            if(!res.ok){
                return rejectWithValue(data.message||"Unable to get Driver")
            }
            return data
        } catch (error) {
               return rejectWithValue(error.message)
        }
    }
)
export const driverLogout=createAsyncThunk(
    "driver/logout",
    async(_,{rejectWithValue})=>{
        try {
            const res=await fetch(`${API_BASE_URL}/driver/logout`,{
                method:"POST",
                credentials:"include"
            })
            const data = await res.json()
            if(!res.ok){
                return rejectWithValue(data.message||"Logout Error")
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
       if(action.payload?.errors){
        state.error=null
       }else{
         state.error=action.payload?.message||"Login Failed"
       }
        state.isAuthenticated=false
     })
     .addCase(driverLogout.pending,(state)=>{
        state.loading=true
        state.error=null
     })
     .addCase(driverLogout.fulfilled,(state)=>{
        state.loading=false
        state.isAuthenticated=false
        state.driver=null
     })
     .addCase(driverLogout.rejected,(state,action)=>{
        state.loading=false
        state.error=action.payload
     })
     .addCase(accessDriver.pending,(state)=>{
        state.loading=true
        state.error=null
     })
     .addCase(accessDriver.fulfilled,(state,action)=>{
        state.loading=false
        state.isAuthenticated=true
        state.driver=action.payload.driver
     })
     .addCase(accessDriver.rejected,(state,action)=>{
        state.loading=false
        state.isAuthenticated = false
        if(action.payload!=="UNAUTHORIZED"){
            state.error=action.payload||"Access denied"
        }else{
            state.error=null
        }
     })
    }
})

export const {clearError,logout}=driverSlice.actions
export default driverSlice.reducer