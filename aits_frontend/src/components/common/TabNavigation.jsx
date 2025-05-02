import React from 'react'

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <div 
          key={index}
          className={`tab ${activeTab === index ? 'active' : ''}`}
          onClick={() => onTabChange(index)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  )
}

export default TabNavigation