import React from 'react'

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr 
            key={rowIndex} 
            onClick={() => onRowClick && onRowClick(row)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                {column.render 
                  ? column.render(row) 
                  : row[column.accessor]
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable