import React from "react";
import { Link } from "react-router-dom";
import { ListGroup, ListGroupItem } from "react-bootstrap";

const Sidebar =() => {
    return(
        <div className="bg-dark text-white vh-100 p-3">
            <h4>Admin Panel</h4>
            <ListGroup variant ="flush">
                <ListGroupItem className="bg-dark border-0">
                    <Link to="/dashboard" className="text-white">Dashboard</Link>
                </ListGroupItem>
                <ListGroupItem className="bg-dark border-0">
                    <Link to ="/users" className="text-white">Users</Link>
                </ListGroupItem>
                <ListGroupItem className="bg-dark border-0">
                    <Link to ="/issues" className="text-white">Issues</Link>
                </ListGroupItem>
                <ListGroupItem className="bg-dark border-0">
                    <Link to ="/reports" className="bg-dark border-0">Reports</Link>
                </ListGroupItem>
            </ListGroup>
        </div>
    );
};

export default Sidebar;