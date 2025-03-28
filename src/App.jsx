import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Dashboard from "./components/dashboard/Dashboard";
import Users from "./components/dashboard/Users";
import Issues from "./components/dashboard/Issues";
import Reports from "./components/dashboard/Reports";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
};

export default App;
