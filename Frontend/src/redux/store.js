import { configureStore } from "@reduxjs/toolkit"
import adminReducer from './slice/admin/adminSlice'
import excelReducer from './slice/excelSlice.js'
import driverReducer from './slice/driver/driverSlice.js'
import JobReducer from './slice/admin/jobSlice'
import RoutesReducer from './slice/admin/routeSlice';
import userAdminReducer from './slice/admin/userLoadSlice.js';
export const store = configureStore({
    reducer: {
        admin: adminReducer,
        routes: RoutesReducer,
        jobs: JobReducer,
        users:userAdminReducer,
        excel:excelReducer,
         driver:driverReducer
    }
})