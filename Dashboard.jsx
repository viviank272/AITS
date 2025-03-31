import React from "react";
import { Container, Row, Col, Card, ProgressBar, CardBody, CardTitle } from "react-bootstrap";
import Sidebar from "./Sidebar";
import { BarChart,Bar ,XAxis,YAxis,Tooltip, ResponsiveContainer } from "recharts";

const userData =[
    {name: "Jan" , users : 30},
    {name: "Feb" ,users : 50},
    {name :"Mar" , users : 40},
    {name : "Apr", users : 70},
    {name : "May",users :90},
];

const Dashboard =() => {
    return(
        <Container fluid className="vh-100">
            <Row>
                <Col md={3} className="p-0">
                   <Sidebar/>
                </Col>

                <Col md={9} className="p-4">
                   <h2 className="mb-4">Administrator Dashboard</h2>

                   <Row className="mb-4">
                    <Col md={4}>
                      <Card className="shadow p-3">
                        <CardBody>
                            <CardTitle>Active Users</CardTitle>
                            <h3>120</h3>
                            <ProgressBar now={80} variant="success" label = "80%"/>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col md={4}>
                      <Card className="shadow p-3">
                        <CardBody>
                            <CardTitle>Pending issues</CardTitle>
                            <h3>35</h3>
                            <ProgressBar now ={50} variant ="warning" label="50%"/>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col md ={4}>
                      <Card className="shadow p-3">
                        <CardBody>
                            <CardTitle>Resolved issues</CardTitle>
                            <h3>85</h3>
                            <ProgressBar now ={85} variant ="primary" label = "85%"/>
                        </CardBody>
                      </Card>
                    </Col>
                   </Row>

                   <Card className="shadow p-4">
                    <CardBody>
                        <CardTitle>User Growth</CardTitle>
                        <ResponsiveContainer width ="100%" height ={300}>
                            <BarChart data={userData}>
                                <XAxis dataKey= "name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey= "users" fill ="#017bff"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                   </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
