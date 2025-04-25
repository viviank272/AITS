import React, { useState } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, FolderIcon } from '@heroicons/react/24/outline';

const Documents = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Course Registration Form.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '2024-03-15 09:30 AM',
      category: 'Registration'
    },
    {
      id: 2,
      name: 'Student ID Request.docx',
      type: 'DOCX',
      size: '1.1 MB',
      uploadedAt: '2024-03-10 02:15 PM',
      category: 'Administrative'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Upload Document
          </button>
        </div>

        <div className="mt-8">
          <div className="flex space-x-4 mb-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option>All Categories</option>
              <option>Registration</option>
              <option>Administrative</option>
              <option>Academic</option>
            </select>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {documents.map((document) => (
                <li key={document.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DocumentIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 hover:text-blue-900">
                            {document.name}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">{document.type}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{document.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {document.category}
                        </span>
                        <button className="ml-4 text-sm text-blue-600 hover:text-blue-900">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents; 