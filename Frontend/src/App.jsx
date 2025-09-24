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
import DriverDashboard from "./components/Drivers/DriverDashboard.jsx";
import DPublicRoutes from "./routes/driver/DPublicRoutes.jsx";

import DProtectRoutes from "./routes/driver/DProtectedRoutes.jsx";
function App() {
  return (
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
        {/*  Page not found error pages */}
        <Route path="*" element={<NotFound />} />

        {/* Drivers */}
      
        </Route>
        <Route element={<DPublicRoutes/>}>
         <Route path="/driver/login" element={<DriverLogin />} />
         </Route>
         
         <Route element={<DProtectRoutes/>}>
          <Route path="/driver/driver-dashboard" element={ <DriverDashboard/>} />
          </Route>
                  



       

      </Routes>
    </Router>
   
  );
}

export default App;
