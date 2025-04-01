import React ,{useState}  from "react";  
import { Container,Form ,Button,Card } from "react-bootstrap";
  

const CreateIssue = ( ) => {
    const [ issue , setIssue] =useState({
        title : "",
        description :"",
        category:"Missing Marks",
        priority :"Low",
        
    });

    const handleChange = (e) =>{
        setIssue({...issue, [e.target.name]: e.target.value });
    };

    const handleSubmit =(e) =>{
        e.preventDefault( );
        console.log("Issue Submitted:", issue);
        alert("Issue Created Successfully!" );
        setIssue({title:"",description:"" ,category :"Missing Marks", priority:"Low"});
    };

    return(
        <Container className ="mt-4">
            <Card className="shadow p-4">
                <h3>Create a New Issue </h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Issue Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={"issue.title"}
                          onChange={handleChange}
                          placeholder="Enter your Issue title"
                          required
                          />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control 
                           as={"textarea"}
                           rows={3}
                           name="description"
                           value={"issue.description"}
                           onChange={handleChange}
                           placeholder="Please describe your issue"
                           required
                           />                        
                        </Form.Group> 
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select name ="category" value ={"issue.category"} onChange={handleChange}>
                                <option value="Missing Marks"> Missing Marks</option>
                                <option value="Wrong Marks">Wrong Marks</option>
                                <option value="Exam Retake Request">Exam Retake Request</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Priority</Form.Label>
                            <Form.Select name="priority" value={"issue.priority"} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </Form.Select>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit Issue
                        </Button>
                        
                </Form>
            </Card>
        </Container>

    );


};

export default CreateIssue;
