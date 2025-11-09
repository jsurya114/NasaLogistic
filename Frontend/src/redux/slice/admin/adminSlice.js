import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import { API_BASE_URL } from "../../../config"

const initialState={
    admin:null,
    isAuthenticated:null,
    loading:false,
    error:null,
    isSuperAdmin:false,
}

export const adminLogin=createAsyncThunk(
    "admin/login",
    async(credentials ,{rejectWithValue})=>{
        try {
            const res=await fetch(`${API_BASE_URL}/admin/login`,{
                method:"POST",
                credentials:'include',
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(credentials),
                credentials:"include"
            })
            const data = await res.json();
           
            if(!res.ok){
                return rejectWithValue(data)
            }
              return data;
        } catch (error) {
            return rejectWithValue({ message: error.message })
        }
    }
)

export const accessAdminUser=createAsyncThunk(
    "admin/access-admin",
    async(_ ,{rejectWithValue})=>{
        try {
            const res=await fetch(`${API_BASE_URL}/admin/access-admin`,{
                method:"GET",
                
                // headers:{"Content-Type":"application/json"},   
                credentials:"include"             
            })
            const data = await res.json();
            
            if(!res.ok){
                return rejectWithValue(data.message||"Unable to get Users")
            }
              return data;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


export const adminLogout=createAsyncThunk(
    "admin/logout",
    async(_ ,{rejectWithValue})=>{
        try {
            const res=await fetch(`${API_BASE_URL}/admin/logout`,{
                method:"POST",
                // headers:{"Content-Type":"application/json"},   
                credentials:"include"             
            })
            const data = await res.json();
            
            if(!res.ok){
                return rejectWithValue(data.message||"Logout Error")
            }
              return data;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const adminSlice = createSlice({
    name:"admin",
    initialState,
    reducers:{
        // logout:(state)=>{
        //     state.isAuthenticated=null
        //     state.error=null
        // },
        clearError:(state)=>{
            state.error=null;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(adminLogin.pending,(state)=>{
            state.loading=true
            state.error=null
        })
        .addCase(adminLogin.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=true;
            state.admin=action.payload.admin;          
            
        })
        .addCase(adminLogin.rejected,(state,action)=>{
            state.loading=false
            if(action.payload?.errors){
                state.error=null
            }else{
                state.error=action.payload?.message||"Login Failed"
            }
        })
         .addCase(adminLogout.pending,(state)=>{
            state.loading=true
            state.error=null
        })
        .addCase(adminLogout.fulfilled,(state)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.admin=null;
        })
        .addCase(adminLogout.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        })
        .addCase(accessAdminUser.pending,(state)=>{
            state.loading=true
            state.error=null
        })
        .addCase(accessAdminUser.fulfilled,(state,action)=>{
            state.loading=false;
            state.isAuthenticated=true;
            state.admin=action.payload.admin;
            // console.log(state.admin);
            if(action.payload.admin.role==='superadmin'){
                state.isSuperAdmin= true;
            }else
                state.isSuperAdmin= false;
                // console.log("State of SuperAdmin ", state.isSuperAdmin);
        })
        .addCase(accessAdminUser.rejected,(state,action)=>{
            state.loading=false;
            state.isAuthenticated = false
        if(action.payload!=="UNAUTHORIZED"){
            state.error=action.payload||"Access denied"
        }else{
            state.error=null
        }
        })
    },
})

export const {logout,clearError} = adminSlice.actions;
export default adminSlice.reducer;
