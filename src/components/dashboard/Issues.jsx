import React from "react";
import { Link } from "react-router-dom";
import {Button, Container } from "react-bootstrap";


const Issues =() =>{
    return(
        <Container className="mt-4">
            <h2>All Issues</h2>
            <Link to ="/create-issue">
              <Button variant="success" className="mb-3">Create a New Issue</Button>
            </Link>
           
        </Container>
    );
};

export default Issues;