import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../config";

export const toggleAdminRole=createAsyncThunk("/admin/toggle-admin-role",
    async(id,{rejectWithValue})=>{
        try{
            const res=await fetch(`${API_BASE_URL}/admin/toggle-admin-role/${id}`,{
                method:"PATCH",
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
                credentials: 'include',
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
    async({page=1},{rejectWithValue})=>{
        try{
            const res= await fetch(`${API_BASE_URL}/admin/get-users?&page=${page}`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
                credentials: 'include',
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

export const getCities = createAsyncThunk('/admin/get-cities',
    async(_,{rejectWithValue})=>{
        try{
            const res= await fetch(`${API_BASE_URL}/admin/get-cities`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
                credentials: 'include',
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

export const getAdmins = createAsyncThunk('/admin/get-admins',
    async({page=1},{rejectWithValue})=>{
        try{
            const res= await fetch(`${API_BASE_URL}/admin/get-admins?page=${page}`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
                credentials: 'include',
            });
            const data= await res.json();
            if(!res.ok){
                return rejectWithValue(data.message||"Error while getting admins data")
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
            headers:{"Content-Type":"application/json"},
            credentials: 'include'
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

export const toggleAvailAdmin= createAsyncThunk(`/admin/toggle-admin`,async(id,{rejectWithValue})=>{
    try{
        // console.log("Entered toggle User route ",id);
        const res = await fetch(`${API_BASE_URL}/admin/toggle-admin/${id}`,{
            method:'PATCH',
            headers:{"Content-Type":"application/json"},
            credentials: 'include'
        });
        const data= await res.json();
        // console.log("Data from server in toggle ",data);
        if(!res.ok){
            return rejectWithValue(data.message||"Disable admin failure");
        }
        return data;
    }catch(err){
        return rejectWithValue(err.message);
    }
})


export const addAdmin= createAsyncThunk(`/admin/create-admin`,
    async(formData,{rejectWithValue})=>{
        try {
            console.log("Admin data ",formData);
            const res=await fetch(`${API_BASE_URL}/admin/create-admin`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData),
                credentials: 'include',
            })
            const data = await res.json();
            // console.log("Response from server ",data);
            if(!res.ok){
                return rejectWithValue(data.message||"Admin Add failure")
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
        drivers:[],
        admins:[],
        page:1,
        city:[],
        totalPages:0,
    },
    reducers:{
        clearMessages: (state) => {
    state.error = null;
    state.success = null;
  },
  clearPaginateTerms:(state)=>{
    state.page=1;
    state.totalPages=0;
  }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(addDriver.pending,(state)=>{
            state.loading=true;  
            state.error = null;
            state.success = null;
        })
        .addCase(addDriver.fulfilled,(state,action)=>{
            state.loading= false;            
            // console.log("Driver added ",action.payload);
            state.drivers.push(action.payload.insertUser);
            state.success= action.payload.message;
            state.error=null;
        })
        .addCase(addDriver.rejected,(state,action)=>{
            state.loading=false;
            state.error= action.payload|| "Failed to add driver";
            state.success=null;
        })
        .addCase(getUsers.pending,(state)=>{
            state.loading=true;
        })
        .addCase(getUsers.fulfilled,(state,action)=>{            
        if (JSON.stringify(state.drivers) !== JSON.stringify(action.payload.drivers)) {
            state.drivers = action.payload.drivers;
            }
            state.page=action.payload.page;
            state.totalPages=action.payload.totalPages;
            state.loading=false;
            state.success= null;
        })
        .addCase(getUsers.rejected,(state,action)=>{
            state.error=action.payload.message;
        })
        .addCase(getAdmins.pending,(state)=>{
            state.loading=true;
        })
        .addCase(getAdmins.fulfilled,(state,action)=>{            
        if (JSON.stringify(state.admins) !== JSON.stringify(action.payload.admins)) {
            state.admins = action.payload.admins;
            }
            state.loading=false;
            state.success= null;
            state.page=action.payload.page;
            state.totalPages=action.payload.totalPages;
        })
        .addCase(getAdmins.rejected,(state,action)=>{
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
         .addCase(toggleAvailAdmin.pending,(state)=>{
            state.loading=true;
        })
        .addCase(toggleAvailAdmin.fulfilled,(state,action)=>{          
             const updatedAdmin = action.payload.data;
            state.admins = state.admins.map(d =>
            d.id === updatedAdmin.id ? updatedAdmin : d
            );        
            state.loading=false;
            state.success= action.payload.message;
        })
        .addCase(toggleAvailAdmin.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload?.message || "Failed to update admin status"
            state.success = null;
        })
         .addCase(toggleAdminRole.pending,(state)=>{
            state.loading=true;
        })
        .addCase(toggleAdminRole.fulfilled,(state,action)=>{          
             const updatedAdmin = action.payload.data;
            state.admins = state.admins.map(d =>
            d.id === updatedAdmin.id ? updatedAdmin : d
            );        
            state.loading=false;
            state.success= action.payload.message;
        })
        .addCase(toggleAdminRole.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload?.message || "Failed to update admin status"
            state.success = null;
        })
        .addCase(addAdmin.pending,(state)=>{
            state.loading=true;
        })
        .addCase(addAdmin.fulfilled,(state,action)=>{          
            state.admins.push(action.payload.insertAdmin)
            state.loading=false;
            state.success= action.payload.message;
        })
        .addCase(addAdmin.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload || "Failed to add admin"
            state.success = null;
        })
         .addCase(getCities.pending,(state)=>{
            state.loading=true;
        })
        .addCase(getCities.fulfilled,(state,action)=>{
            console.log("From cities",action.payload.cities);            
            state.city=action.payload.cities;
            state.loading=false;
            state.success= true;
        })
        .addCase(getCities.rejected,(state,action)=>{
            state.error=action.payload.message;
            state.city=[];
        })
    }
})
export const {clearMessages,clearPaginateTerms} =userLoadSlice.actions
export default userLoadSlice.reducer;
