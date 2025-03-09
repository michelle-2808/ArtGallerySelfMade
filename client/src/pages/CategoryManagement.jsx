
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PREDEFINED_CATEGORIES = [
  'Painting', 'Sculpture', 'Photography', 'Digital Art', 'Prints', 'Mixed Media', 'Other'
];

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState({});
  
  useEffect(() => {
    fetchCategoryData();
  }, []);
  
  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/category-stats');
      const categoryCounts = response.data.categoryCounts;
      
      // Ensure all predefined categories are included
      const allCategories = [...PREDEFINED_CATEGORIES];
      
      // Add any categories that might exist in the database but aren't predefined
      Object.keys(categoryCounts).forEach(category => {
        if (!allCategories.includes(category)) {
          allCategories.push(category);
        }
      });
      
      setCategories(allCategories);
      setProductCounts(categoryCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              These are the predefined categories for your products. The product count shows how many products are currently using each category.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{category}</h3>
                    <p className="text-gray-500 text-sm">
                      {productCounts[category] || 0} products
                    </p>
                  </div>
                  {category !== 'Other' && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      PREDEFINED_CATEGORIES.includes(category)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {PREDEFINED_CATEGORIES.includes(category) ? 'Predefined' : 'Custom'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">About Categories</h3>
              <p className="text-gray-600">
                Categories help organize your art gallery products for better customer navigation. 
                These predefined categories cover the main types of artwork. If you need a different 
                category, you can use "Other" and specify details in the product description or tags.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
