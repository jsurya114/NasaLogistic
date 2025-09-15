import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Jobs from "./components/Jobs";

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
       
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/admin/dashboard" element={<Dashboard/>} />
         <Route path="/admin/jobs" element={<Jobs />} />
         
        
      </Routes>
    </Router>
    
  
  
  );
}

export default App;
