import {configureStore} from "@reduxjs/toolkit"
import adminReducer from './slice/adminSlice'

export const store =configureStore({
    reducer:{
        admin:adminReducer,
    }
})