import {configureStore} from "@reduxjs/toolkit"
import adminReducer from './slice/adminSlice'
import JobReducer from './slice/jobSlice'
export const store =configureStore({
    reducer:{
        admin:adminReducer,
       jobs:JobReducer
    }
})