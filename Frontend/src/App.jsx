import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Jobs from "./components/Jobs";
import RoutesForm from "./components/routes-form.jsx";
import AddUsers from "./components/AddUsers.jsx";
import NotFound from "./components/NotFound.jsx";
import DoubleStop from "./components/DoubleStop.jsx";
import ProtectedRoutes from "./routes/ProtectedRoute.jsx";
import PublicRoutes from "./routes/PublicRoutes.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route element={<PublicRoutes/>}>
        <Route path="/admin/login" element={<Login />} />
        </Route>
       <Route element={<ProtectedRoutes />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/jobs" element={<Jobs />} />
        <Route path="/admin/routes" element={<RoutesForm />} />
        <Route path="/admin/create-users" element={<AddUsers />} />
        <Route path="/admin/double-stop" element={<DoubleStop/>}/>
        {/*  Page not found error pages */}
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
