import React from 'react'

const CollegePerformance = ({ data, onCollegeSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-xl font-bold text-[#1e1e77]">College Performance</h2> */}
        <select
          value={data.selectedCollege}
          onChange={(e) => onCollegeSelect(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {data.allColleges.map(college => (
            <option key={college} value={college}>{college}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Issues</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Compliance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.colleges.map((college) => (
              <tr key={college.name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{college.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {college.issues}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative w-32 h-2 bg-gray-200 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded"
                        style={{ width: college.sla }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{college.sla}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {college.response}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CollegePerformance