import React from "react";
import "./lecturer.css";

const LecturerDashboard = () => {
  return (
    <div className="lecturer-container">
      <aside className="sidebar">
        <h2>Lecturer Menu</h2>
        <ul>
          <li>Dashboard</li>
          <li>Courses</li>
          <li>Assignments</li>
          <li>Settings</li>
        </ul>
      </aside>
      <main>
        <header className="header">
          <h1>Welcome, Lecturer</h1>
        </header>
        <section className="content">
          <div className="tab active">Overview</div>
          <div className="tab">Students</div>
          <div className="tab">Reports</div>
        </section>
        <section className="actions">
          <button className="action-button">Create Course</button>
          <button className="action-button">Upload Material</button>
        </section>
        <div className="notification-badge">3 New Notifications</div>
      </main>
    </div>
  );
};

export default LecturerDashboard;