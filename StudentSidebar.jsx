import React from "react";
import { Link } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

const StudentSidebar = () => {
  return (
    <div className="bg-primary text-white vh-100 p-3">
      <h4>Student Panel</h4>
      <ListGroup variant="flush">
        <ListGroup.Item className="bg-primary border-0">
          <Link to="/student-dashboard" className="text-black">Dashboard</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-primary border-0">
          <Link to="/courses" className="text-white">My Courses</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-primary border-0">
          <Link to="/assignments" className="text-white">Assignments</Link>
        </ListGroup.Item>
        <ListGroup.Item className="bg-primary border-0">
          <Link to="/reports" className="text-white">Performance Reports</Link>
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
};

export default StudentSidebar;

