import React, {useState} from "react";
import {Container,Form,Button, Card, FormGroup, FormLabel, FormSelect, FormControl } from "react-bootstrap";

const Login = ({onLogin}) => {
    const [email, setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [role , setRole] = useState("Student");

    const handleSubmit =(e) => {
        e.preventDefault () ;
        console.log({email,password,role});
        onLogin({email, password, role });
    };

    return(
        <Container className="d-flex justify-content-creator align -items-center vh-100">
            <Card className="p-5 shadow-lg" style={{width:"2000px"}}>
                <h2 className="text-center mb-3">Academic Issue Tracking System</h2>
                <h4 className="text-center mb-3">Welcome</h4>
                <Form onSubmit={handleSubmit}>
                    <FormGroup className="mb-5">
                        <FormLabel>Select Role </FormLabel>
                        <FormSelect value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="student">Student</option>
                            <option value ="lecturer">Lecturer</option>
                            <option value="registrar">Registrar</option>
                        </FormSelect>
                    </FormGroup>

                    <FormGroup className="mb-5">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl
                           type ="email"
                           placeholder="Enter email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                        />   

                    </FormGroup>

                    <FormGroup className="mb-5">
                        <FormLabel>Password</FormLabel>
                        <FormControl
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />  
                    </FormGroup>

                    <Button variant="primary" type="submit" className="w-150">
                        Login
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};


export default Login;