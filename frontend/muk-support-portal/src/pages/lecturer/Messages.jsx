import React, { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaSearch } from 'react-icons/fa';

function LecturerMessages() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John Doe', subject: 'Question about Assignment', date: '2024-03-24', read: false },
    { id: 2, sender: 'Jane Smith', subject: 'Request for Extension', date: '2024-03-23', read: true },
  ]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <FaEnvelope /> New Message
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                } ${!message.read ? 'font-semibold' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{message.sender}</p>
                    <p className="text-sm text-gray-600">{message.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500">{message.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          {selectedMessage ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h2>
                  <p className="text-gray-600">From: {selectedMessage.sender}</p>
                  <p className="text-sm text-gray-500">Date: {selectedMessage.date}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <FaPaperPlane className="w-5 h-5" />
                </button>
              </div>
              <div className="prose max-w-none">
                <p>Message content will be displayed here...</p>
              </div>
              <div className="mt-6">
                <textarea
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Type your reply..."
                />
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LecturerMessages; 