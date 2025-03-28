import React from "react";
import Login from "./login"; // Import the Login component

const App = () => {
  const handleLogin = (userData) => {
    console.log("User logged in:", userData);
    // Add authentication logic here
  };

  return (
    <div>
      <Login onLogin={handleLogin} />
    </div>
  );
};

export default App;
