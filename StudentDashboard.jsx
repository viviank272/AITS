import React from "react";
import { Container, Row, Col, Card, ProgressBar } from "react-bootstrap";
import Sidebar from "./StudentSidebar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
    { month: "Jan", score: 75 },
    { month: "Feb", score: 89 },
    { month: "Mar", score: 67 },
    { month: "Apr", score: 70 },
    { month: "May", score: 90 },
];

const StudentDashboard = () => {
    return (
        <Container fluid className="vh-100">
            <Row>
                <Col md={3} className="p-0">
                    <Sidebar />
                </Col>
                <Col md={9} className="p-3">
                    <h2 className="mb-4">Student's Dashboard</h2>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="shadow p-3">
                                <Card.Body>
                                    <Card.Title>Coursework Progress</Card.Title>
                                    <h3>75%</h3>
                                    <ProgressBar  now={75} variant="success" label="75%" />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="shadow p-3">
                                <Card.Body>
                                    <Card.Title>Assignments Completed</Card.Title>
                                    <h3>6/8</h3>
                                    <ProgressBar now={75} variant="info" label="75%" />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="shadow p-3">
                        <Card.Body>
                            <Card.Title>Performance Over Time</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={performanceData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#007bff" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StudentDashboard;
