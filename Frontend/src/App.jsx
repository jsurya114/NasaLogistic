import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Admin/Login";
import Dashboard from "./components/Admin/Dashboard";
import Jobs from "./components/Admin/Jobs";
import RoutesForm from "./components/Admin/routes-form.jsx";
import AddUsers from "./components/Admin/AddUsers.jsx";
import NotFound from "./components/Admin/NotFound.jsx";
import DoubleStop from "./components/Admin/DoubleStop.jsx";
import ProtectedRoutes from "./routes/admin/ProtectedRoute.jsx";
import PublicRoutes from "./routes/admin/PublicRoutes.jsx";
import DriverLogin from "./components/Drivers/DriverLogin.jsx";
import Journey from "./components/Drivers/Journey.jsx";
import DPublicRoutes from "./routes/driver/DPublicRoutes.jsx";
import Devlivery from "./components/Drivers/Delivery.jsx"

import DProtectRoutes from "./routes/driver/DProtectedRoutes.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AddAccessCodePage from "./components/Admin/AccessCode.jsx"
import DriverAccessCodePage from "./components/Drivers/accessCode.jsx";
import AdminJourney from "./components/Admin/AdminJorney.jsx";
function App() {
  return (
  <>
  
    <Router>
      <Routes>



        {/* Public Route */}
        <Route element={<PublicRoutes/>}>
        <Route path="/admin/login" element={<Login />} />
        
     
        </Route>
          
       <Route element={<ProtectedRoutes />}>
       {/* Admins */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/jobs" element={<Jobs />} />
        <Route path="/admin/routes" element={<RoutesForm />} />
        <Route path="/admin/create-users" element={<AddUsers />} />
        <Route path="/admin/double-stop" element={<DoubleStop/>}/>
       <Route path="/admin/manage-access-codes" element={<AddAccessCodePage/>}/>
         <Route path="/admin/journeys" element={<AdminJourney/>}/>
        {/*  Page not found error pages */}


        {/* Drivers */}
      
        </Route>
        <Route element={<DPublicRoutes/>}>
         <Route path="/driver/login" element={<DriverLogin />} />
         </Route>
         
         <Route element={<DProtectRoutes/>}>
          <Route path="/driver/driver-dashboard" element={ <Journey/>} />
          <Route path="/driver/access-codes" element={<DriverAccessCodePage />} />
          <Route path="/driver/delivery" element={<Devlivery/>}/>
          
          </Route>
                  
    {/* Catch-all 404 route */}
    <Route path="*" element={<NotFound />} />


       

      </Routes>
             <ToastContainer />
    </Router>
      <ToastContainer />
  </>
   
  );
}

export default App;
