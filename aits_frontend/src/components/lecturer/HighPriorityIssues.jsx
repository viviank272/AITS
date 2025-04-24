import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faUser, faComment, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const CriticalPriorityIssues = ({ issues, onViewIssue }) => {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h2>Critical Priority Issues</h2>
        <a href="#" style={{ fontSize: '0.8rem', color: 'var(--lecturer-primary-color)' }}>View All</a>
      </div>
      <div className="panel-content">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {issues.map((issue, index) => (
            <li key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '15px 20px',
              borderBottom: index < issues.length - 1 ? '1px solid #e0e0e0' : 'none',
              cursor: 'pointer'
            }} onClick={() => onViewIssue(issue)}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-color)',
                marginRight: '15px'
              }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: '5px' }}>{issue.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', display: 'flex' }}>
                  <span style={{ marginRight: '10px' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} /> {issue.date}
                  </span>
                  {issue.student && (
                    <span style={{ marginRight: '10px' }}>
                      <FontAwesomeIcon icon={faUser} /> {issue.student}
                    </span>
                  )}
                  {issue.comments && (
                    <span style={{ marginRight: '10px' }}>
                      <FontAwesomeIcon icon={faComment} /> {issue.comments} comments
                    </span>
                  )}
                  {issue.urgent && (
                    <span style={{
                      backgroundColor: '#ffebee',
                      color: 'var(--danger-color)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}>
                      {issue.urgent}
                    </span>
                  )}
                </div>
              </div>
              <FontAwesomeIcon icon={faChevronRight} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CriticalPriorityIssues