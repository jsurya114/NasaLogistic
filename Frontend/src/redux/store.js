import { configureStore } from "@reduxjs/toolkit"
import adminReducer from '../redux/slice/admin/adminSlice.js'
import JobReducer from '../redux/slice/admin/jobSlice'
import RoutesReducer from '../redux/slice/admin/routeSlice';
import userAdminReducer from '../redux/slice/admin/userLoadSlice.js';
import driverReducer from "../redux/slice/driver/driverSlice.js"
import accessCodeReducer from "../redux/slice/admin/accessCodeSlice.js"
import excelReducer from './slice/excelSlice.js'

export const store = configureStore({
    reducer: {
        admin: adminReducer,
        routes: RoutesReducer,
        jobs: JobReducer,
        users:userAdminReducer,
        driver:driverReducer,
        accessCodes: accessCodeReducer
    }
})