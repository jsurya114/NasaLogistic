import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const addUsersAdminSlice=createSlice({
    name:"usersCumAdmin",
    initialState:{
        loading:false,
        error:null,
        isSuperAdmin:false,
       
    }
})

