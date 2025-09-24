import { configureStore } from "@reduxjs/toolkit"
import adminReducer from './slice/adminSlice'
import excelReducer from './slice/excelSlice.js'

import JobReducer from './slice/jobSlice'
import RoutesReducer from './slice/routeSlice';
import userAdminReducer from './slice/userLoadSlice.js';
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