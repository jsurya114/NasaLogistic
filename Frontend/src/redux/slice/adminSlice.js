import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"

const initialState={
    token:null,
    loading:false,
    error:null
}

export const adminLogin=createAsyncThunk(
    "admin/login",
    async(credentials ,{rejectWithValue})=>{
        try {
            const res=await fetch("http://localhost:3251/admin/login",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(credentials),
            })
            const data = await res.json()
            if(!res.ok){
                return rejectWithValue(data.message||"Login failed")
            }
              return data.token
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const adminSlice = createSlice({
    name:"admin",
    initialState,
    reducers:{
        logout:(state)=>{
            state.token=null
            state.error=null
            localStorage.removeItem("adminToken")
        },
    },
    extraReducers:(builder)=>{
        builder
        .addCase(adminLogin.pending,(state)=>{
            state.loading=true
            state.error=null
        })
        .addCase(adminLogin.fulfilled,(state,action)=>{
            state.loading=false;
            state.token=action.payload;
            localStorage.setItem("adminToken",action.payload)
        })
        .addCase(adminLogin.rejected,(state,action)=>{
            state.loading=false
            state.error=action.payload
        })
    },
})

export const {logout} = adminSlice.actions
export default adminSlice.reducer
