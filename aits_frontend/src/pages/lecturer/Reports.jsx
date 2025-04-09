import React, { useState } from 'react';
import { FaChartBar, FaDownload, FaCalendar, FaFilter } from 'react-icons/fa';

function LecturerReports() {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState('week');

  const reports = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Track student attendance and participation',
      data: {
        totalStudents: 45,
        averageAttendance: '92%',
        topPerformingStudents: ['John Doe', 'Jane Smith', 'Mike Johnson']
      }
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Monitor student performance and grades',
      data: {
        averageGrade: '85%',
        passingRate: '95%',
        topScorers: ['Alice Brown', 'Bob Wilson', 'Carol Davis']
      }
    },
    {
      id: 'issues',
      title: 'Issue Resolution Report',
      description: 'Track support issues and resolution times',
      data: {
        totalIssues: 28,
        resolvedIssues: 25,
        averageResolutionTime: '2.5 days'
      }
    }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="flex items-center gap-4">
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="semester">This Semester</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              selectedReport === report.id
                ? 'border-2 border-blue-500'
                : 'hover:border-2 hover:border-gray-300'
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaChartBar className="text-blue-500 text-xl" />
              <h3 className="font-semibold text-lg">{report.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{report.description}</p>
            <div className="space-y-2">
              {Object.entries(report.data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {reports.find(r => r.id === selectedReport)?.title} Details
          </h2>
          <div className="flex items-center gap-2">
            <FaCalendar className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'This semester'}
            </span>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart visualization will be displayed here</p>
        </div>
      </div>
    </div>
  );
}

export default LecturerReports; 