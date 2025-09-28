import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

export const checkUserOrAdmin=createAsyncThunk("/admin/check-for-user",
    async(_,{rejectWithValue})=>{
        try{
            const res=await fetch(`${API_BASE_URL}/admin/check-for-user`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
            });
            const data = await res.json();
            if(!res.ok){
                return rejectWithValue(err.message||'Failure to get details of Admin')
            }
            return data;
        }catch(err){
            return rejectWithValue(err.message)
        }
    }
)


export const addDriver= createAsyncThunk("/admin/create-users",
    async(formData,{rejectWithValue})=>{
        try {
            console.log("formdata of driver ",formData);
            const res=await fetch(`${API_BASE_URL}/admin/create-users`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData),
            })
            const data = await res.json();
            // console.log("Response from server ",data);
            if(!res.ok){
                return rejectWithValue(data.message||"User Add failure")
            }
              return data;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const getUsers = createAsyncThunk('/admin/get-users',
    async(_,{rejectWithValue})=>{
        try{
            const res= await fetch(`${API_BASE_URL}/admin/get-users`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
            });
            const data= await res.json();
            if(!res.ok){
                return rejectWithValue(data.message||"Error while getting users data")
            }
            return data;
        }catch(err){
            return rejectWithValue(err.message)
        }
    }
)

export const toggleAvailUser= createAsyncThunk(`/admin/toggle-user`,async(id,{rejectWithValue})=>{
    try{

        // console.log("Entered toggle User route ",id);
        const res = await fetch(`${API_BASE_URL}/admin/toggle-user/${id}`,{
            method:'PATCH',
            headers:{"Content-Type":"application/json"}
        });
        const data= await res.json();
        // console.log("Data from server in toggle ",data);
        if(!res.ok){
            return rejectWithValue(data.message||"Deletion failure");
        }
        return data;
    }catch(err){
        return rejectWithValue(err.message);
    }
})


export const addAdmin= createAsyncThunk(`${API_BASE_URL}/admin/create-admin`,
    async(formData,{rejectWithValue})=>{
        try {
            const res=await fetch("/admin/create-admin",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData),
            })
            const data = await res.json();
            // console.log("Response from server ",data);
            if(!res.ok){
                return rejectWithValue(data.message||"User Add failure")
            }

              return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const userLoadSlice=createSlice({
    name:"usersCumAdmin",
    initialState:{
        loading:false,
        error:null,
        success:null,
        // isSuperAdmin:false,
        drivers:[],
        admins:[]
    },
    reducers:{
        clearMessages: (state) => {
    state.error = null;
    state.success = null;
  },
    },
    extraReducers:(builder)=>{
        builder
        .addCase(addDriver.pending,(state)=>{
            state.loading=true;  
        })
        .addCase(addDriver.fulfilled,(state,action)=>{
            state.loading= false;            
            console.log("Driver added ",action.payload);
            state.drivers.push(action.payload.insertUser);
            state.success= action.payload.message;
            state.error=null;
        })
        .addCase(addDriver.rejected,(state,action)=>{
            state.error= action.payload.message;
            state.success=null;
        })
        .addCase(getUsers.pending,(state)=>{
            state.loading=true;
        })
        .addCase(getUsers.fulfilled,(state,action)=>{            
        if (JSON.stringify(state.drivers) !== JSON.stringify(action.payload.data)) {
            state.drivers = action.payload.data;
            }
            state.loading=false;
            state.success= null;
        })
        .addCase(getUsers.rejected,(state,action)=>{
            state.error=action.payload.message;
        })
         .addCase(toggleAvailUser.pending,(state)=>{
            state.loading=true;
        })
        .addCase(toggleAvailUser.fulfilled,(state,action)=>{          
             const updatedDriver = action.payload.data;
            state.drivers = state.drivers.map(d =>
            d.id === updatedDriver.id ? updatedDriver : d
            );        
            state.loading=false;
            state.success= action.payload.message;
        })
        .addCase(toggleAvailUser.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload?.message || "Failed to update driver status"
            state.success = null;
        })
    }
})
export const {clearMessages} =userLoadSlice.actions
export default userLoadSlice.reducer;
