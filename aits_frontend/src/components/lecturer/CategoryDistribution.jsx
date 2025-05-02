import React from 'react'

const CategoryDistribution = ({ categories, timeRange, onTimeRangeChange }) => {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Category Distribution</h2>
        <select 
          style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px', fontSize: '0.8rem' }}
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
        >
          <option value="7days">Last 7 days</option>
          <option value="month">This month</option>
          <option value="semester">This semester</option>
        </select>
      </div>
      <div className="panel-content">
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-end',
          padding: '20px' 
        }}>
          {categories.map((category, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: `${category.height}px`, 
                  backgroundColor: category.color, 
                  borderRadius: '4px 4px 0 0', 
                  marginBottom: '10px' 
                }}
              ></div>
              <div style={{ fontSize: '0.8rem', textAlign: 'center', color: '#7f8c8d' }}>
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryDistribution