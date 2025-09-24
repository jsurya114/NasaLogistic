import { useEffect,useState } from "react";

import { Navigate } from "react-router-dom";
 function ProtectedRoute({children}){
    const [auth,setAuth]=useState(null)
    useEffect(()=>{
        fetch("/admin/check-auth",{
            method:"GET",
            credentials:"include"
        })
        .then((res)=>setAuth(res.ok))
        .catch(()=>setAuth(false))
    },[])
    if(auth===null){
        return <div>loading...</div>
    }
    return auth ? children : <Navigate to ="/admin/login" replace/>
 }

 export default ProtectedRoute