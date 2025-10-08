import { configureStore } from "@reduxjs/toolkit"
import adminReducer from '../redux/slice/admin/adminSlice.js'
import JobReducer from '../redux/slice/admin/jobSlice'
import RoutesReducer from '../redux/slice/admin/routeSlice';
import userAdminReducer from '../redux/slice/admin/userLoadSlice.js';
import driverReducer from "../redux/slice/driver/driverSlice.js"
import accessCodeReducer from "../redux/slice/admin/accessCodeSlice.js"
import excelReducer from './slice/admin/excelSlice.js'
import driverAccessCodeReducer from "./slice/driver/driverAccessCodeSlice.js";
import doubleStop from './slice/admin/doublestopSlice.js'
import AdminDashboardReducer from './slice/admin/dashboardUpdateSlice.js'
import paymentDashboardReducer from './slice/admin/paymentDashboardSlice.js'

import journeyReducer from "../redux/slice/driver/journeySlice.js"
export const store = configureStore({
    reducer: {
        admin: adminReducer,
        routes: RoutesReducer,
        jobs: JobReducer,
        users:userAdminReducer,
        driver:driverReducer,
        accessCodes: accessCodeReducer,
        journey:journeyReducer,
        ds:doubleStop,
        dashboard:AdminDashboardReducer,
        paymentDashboard:paymentDashboardReducer
    }
})