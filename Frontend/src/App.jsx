import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {

  
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/admin/dashboard" element={<Dashboard/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
