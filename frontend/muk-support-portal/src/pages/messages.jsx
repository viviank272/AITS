import React, { useState } from 'react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Dr. John Doe',
      content: 'Your issue has been reviewed and assigned to the IT department.',
      timestamp: '2024-03-20 10:30 AM',
      read: true
    },
    {
      id: 2,
      sender: 'System',
      content: 'Your issue status has been updated to "In Progress"',
      timestamp: '2024-03-19 02:15 PM',
      read: false
    }
  ]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <div className="flex space-x-4">
            <Link 
              to="/docs/communication-guide" 
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              Communication Guide
            </Link>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              New Message
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li key={message.id} className={`hover:bg-gray-50 ${!message.read ? 'bg-blue-50' : ''}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <p className={`text-sm font-medium ${!message.read ? 'text-blue-600' : 'text-gray-900'}`}>
                          {message.sender}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{message.timestamp}</div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{message.content}</p>
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

export default Messages; 