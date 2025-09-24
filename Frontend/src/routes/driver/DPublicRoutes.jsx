import { Navigate,Outlet } from "react-router-dom";

import { useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import { accessDriver } from "../../redux/slice/driver/driverSlice.js";

function DPublicRoutes(){
    const dispatch = useDispatch()
    const {isAuthenticated}=useSelector((state)=>state.driver)

    useEffect(()=>{
        dispatch(accessDriver())
    },[dispatch])

    return isAuthenticated ? <Navigate to ="/driver/driver-dashboard" /> :<Outlet/>
}

export default DPublicRoutes