import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import CategoryForm from '../../components/categories/CategoryForm';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Mock data for testing
  const mockCategories = [
    {
      id: 1,
      name: 'Technical Support',
      description: 'Issues related to technical problems with university systems',
      priority_level: 'High',
      response_time: '24 hours',
      department: 'IT Support',
      is_active: true
    },
    {
      id: 2,
      name: 'Academic Issues',
      description: 'Issues related to academic matters such as registration and courses',
      priority_level: 'Medium',
      response_time: '48 hours',
      department: 'Academic Affairs',
      is_active: true
    },
    {
      id: 3,
      name: 'Facility Issues',
      description: 'Issues related to university facilities and infrastructure',
      priority_level: 'Low',
      response_time: '72 hours',
      department: 'Facilities Management',
      is_active: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setCategories(mockCategories);
    setLoading(false);
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    // Add confirmation dialog and API call here
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const handleSubmit = (categoryData) => {
    if (selectedCategory) {
      // Update existing category
      setCategories(categories.map(category =>
        category.id === selectedCategory.id ? { ...category, ...categoryData } : category
      ));
    } else {
      // Add new category
      setCategories([...categories, { ...categoryData, id: categories.length + 1 }]);
    }
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Category Management</h1>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>

        {/* Category List */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Priority Level</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Response Time</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-gray-500">{category.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            category.priority_level === 'High' ? 'bg-red-100 text-red-800' :
                            category.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {category.priority_level}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{category.response_time}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{category.department}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default CategoryManagement; 