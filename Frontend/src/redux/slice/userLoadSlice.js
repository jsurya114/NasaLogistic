import { createSlice, createAsyncThunk, isAction } from "@reduxjs/toolkit";

export const addDriver= createAsyncThunk("/admin/create-users",
    async(formData,{rejectWithValue})=>{
        try {
            console.log("formdata of driver ",formData);
            const res=await fetch("http://localhost:3251/admin/create-users",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData),
            })
            const data = await res.json();
            console.log("Response from server ",data);
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
            const res= await fetch('http://localhost:3251/admin/get-users',{
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

export const toggleAvailUser= createAsyncThunk("/admin/toggle-user",async(id,{rejectWithValue})=>{
    try{

        console.log("Entered toggle User route ",id);
        const res = await fetch(`http://localhost:3251/admin/toggle-user/${id}`,{
            method:'patch',
            headers:{"Content-Type":"application/json"}
        });
        const data= await res.json();
        if(!res.ok){
            return rejectWithValue(data.message||"Deletion failure");
        }
        return data;
    }catch(err){
        return rejectWithValue(err.message);
    }
})


export const addAdmin= createAsyncThunk("http://localhost:3251/admin/create-admin",
    async(formData,{rejectWithValue})=>{
        try {
            const res=await fetch("/admin/create-admin",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData),
            })
            const data = await res.json();
            console.log("Response from server ",data);
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
        isSuperAdmin:false,
        drivers:[],
        admins:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(addDriver.pending,(state)=>{
            state.loading=true;  
        })
        .addCase(addDriver.fulfilled,(state,action)=>{
            state.loading= false;
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
            // console.log("Get users fulfilled",action.payload.data);
            state.drivers=action.payload.data;
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
            const updatDriver= action.payload.data;
            state.drivers= state.drivers.map(d=>{
                d.id===updatDriver.id ? updatDriver :d
            });            
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

export default userLoadSlice.reducer;

