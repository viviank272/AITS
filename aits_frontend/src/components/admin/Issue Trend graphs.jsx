import React from  "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, PointElement, Title, Tooltip, Legend } from "chart.js";



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IssueByStatus = () => {
    const data = {
        labels: ["Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Issues by Status",
                data: [5, 5, 18, 6, 9, 4, 9],
                borderColor: "rgba(54, 37, 235, 1)",
                backgroundColor: "rgba(205, 232, 250, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Issues by Status",
            },
        },
    };

    return <Line data={data} options={options} />;
};

const IssueByCategory = () => {
    const data = {
        labels: ["Academic Issues", "Technical support", "Administrative"],
        datasets: [
            {
                label: "Issues by Category",
                data: [25, 15, 10],
                borderColor: "rgb(70, 275, 151)",
                backgroundColor: "rgba(87, 86, 275, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Issues by Category",
            },
        },
    };

    return <Line data={data} options={options} />;
};

const IssueByCollege = () => {
    const data = {
        labels: ["College of Agricultural and Environmental Science", "College of Business and Management Sciences", "College of Computing and Information Sciences", "College of Education and External Studies"," College of Engineering, Design, Art and Technology"," College of Health Sciences"," College of Humanities and Social Sciences"," College of Natural Sciences"," College of Veterinary Medicine, Animal Resources and Biosecurity","School of Law"],
        datasets: [
            {
                label: "Issues by College",
                data: [20, 15, 10, 5, 25, 40, 12, 18, 22, 8],
                borderColor: "rgba(153, 102, 255, 1)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Issues by the College",
            },
        },
    };

    return <Line data={data} options={options} />;
};

const IssueGraphs = () => {
    return (
        <div>
            <h2>Issues Trends</h2>
            <div style={{ marginBottom: "2rem" }}>
                <IssueTrendGraphs />
            </div>
            <div style={{ marginBottom: "2rem" }}>
                <IssueByStatus />
            </div>
            <div style={{ marginBottom: "2rem" }}>
                <IssueByCategory />
            </div>
            <div>
                <IssueByCollege />
            </div>
        </div>
    );
};

export default IssueGraphs;
