import React from "react";
import "./global.css";

const GlobalLayout = ({ children }) => {
  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Global Sidebar</h2>
        <ul>
          <li>Home</li>
          <li>Dashboard</li>
          <li>Settings</li>
          <li>Logout</li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="header">
          <h1>Global Header</h1>
          <button className="action-button">
            <i className="icon">+</i> Add New
          </button>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
};

export default GlobalLayout;