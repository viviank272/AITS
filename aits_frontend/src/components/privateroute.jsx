import React from "react";
import "./privateroute.css"; 
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, isLoading }) => {
  if (isLoading) {
    console.log("Checking authentication status...");
    return <div>Loading...</div>; // Fallback loader while checking authentication
  }

  if (isAuthenticated) {
    console.log("User is authenticated, granting access.");
    return <Outlet />;
  } else {
    console.log("User is not authenticated, redirecting to login.");
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;