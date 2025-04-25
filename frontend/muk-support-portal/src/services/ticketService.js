const API_URL = '/api';

export const getTickets = async (filters = {}) => {
  try {
    // In a real application, you would fetch from your backend
    // For now, we'll return a mock promise
    return Promise.resolve([
      {
        id: 'TKT-2023-001',
        title: 'Cannot access course materials',
        description: 'I am unable to access my course materials for COM3456.',
        priority: 'high',
        status: 'open',
        category: 'academic',
        createdAt: '2025-03-15T09:30:00',
        updatedAt: '2025-03-20T14:20:00',
        student: {
          id: '2021/HD/12345/PS',
          name: 'John Doe',
          avatar: '/api/placeholder/30/30'
        },
        assignedTo: {
          id: 'LEC001',
          name: 'Dr. Sarah Johnson',
          avatar: '/api/placeholder/30/30'
        },
        comments: 3
      },
      // ... other ticket objects
    ]);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

export const createTicket = async (ticketData) => {
  try {
    // In a real application, you would post to your backend
    return Promise.resolve({
      id: `TKT-2023-${Math.floor(Math.random() * 1000)}`,
      ...ticketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: 0
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicket = async (ticketId, updates) => {
  try {
    // In a real application, you would update your backend
    return Promise.resolve({
      id: ticketId,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};